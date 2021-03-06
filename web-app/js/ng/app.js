/***********************************
 * app.js
 */

var app = angular.module('tree-edit-app', ['Mark.Lagendijk.RecursionHelper', 'ngSanitize', 'ngRoute']);

app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/login/', {
            templateUrl: 'ng/auth/login.html',
            controller: 'Authentication'
        })
        .when('/classification/', {
            templateUrl: 'ng/classifications/list.html',
            controller: 'Classificationslist'
        })
        .when('/checklist/', {
            templateUrl: 'ng/checklist/checklist.html',
            controller: 'Checklist'
        })
        .when('/workspaces/', {
            templateUrl: 'ng/workspaces/list.html',
            controller: 'Workspaceslist'
        })
        .when('/verification/verify/', {
            templateUrl: 'ng/verification/verify.html',
            controller: 'Verify'
        })
        .when('/verification/changes/', {
            templateUrl: 'ng/verification/changes.html',
            controller: 'Changes'
        })
        .when('/workspaces/edit', {
            templateUrl: 'ng/workspaces/edit.html',
            controller: 'Workspace'
        })
        .when('/search/', {
            templateUrl: 'ng/search/search.html',
            controller: 'Search'
        });

    // configure html5 to get links working on jsfiddle
    $locationProvider.html5Mode(true);
});

var AppbodyController = ['$route', '$scope', '$rootScope', '$element', '$location', '$routeParams', 'auth',
    function ($route, $scope, $rootScope, $element, $location, $routeParams, auth) {

    $scope.$route = $route;
    $scope.$location = $location;
    $scope.$routeParams = $routeParams;

    // not using a directive to manage scope values - I'll just do this here
    $rootScope.servicesUrl = $element[0].getAttribute('data-services-url');
    $rootScope.pagesUrl = $element[0].getAttribute('data-pages-url');
    $rootScope.namespace = $element[0].getAttribute('data-namespace');

    $scope.isLoggedIn = auth.isLoggedIn;

    function bookmarks(category) {
        if (!category || !$rootScope.namespace) return {};

        var modified = false;

        var bookmarks = JSON.parse(localStorage.getItem('nsl-tree-editor.bookmarks'));

        if (!bookmarks) {
            bookmarks = {};
            modified = true;
        }

        if (!bookmarks[$rootScope.namespace]) {
            bookmarks[$rootScope.namespace] = {};
            modified = true;
        }

        if (!bookmarks[$rootScope.namespace][category]) {
            bookmarks[$rootScope.namespace][category] = {};
            modified = true;
        }

        if (!bookmarks[$rootScope.namespace][category].set) {
            bookmarks[$rootScope.namespace][category].set = {};
            modified = true;
        }

        if (!bookmarks[$rootScope.namespace][category].vec) {
            bookmarks[$rootScope.namespace][category].vec = [];
            modified = true;
        }

        if (modified) {
            localStorage.setItem('nsl-tree-editor.bookmarks', JSON.stringify(bookmarks));
        }

        return bookmarks;
    }

    $rootScope.getBookmarks = function (category) {
        var bm = bookmarks(category);
        return bm[$rootScope.namespace][category];
    };

    $rootScope.clearBookmarks = function (category) {
        var bm = bookmarks(category);
        var thebiz = bm[$rootScope.namespace][category];

        thebiz.set = {};
        thebiz.vec = [];
        localStorage.setItem('nsl-tree-editor.bookmarks', JSON.stringify(bm));
        $rootScope.$broadcast('nsl-tree-edit.bookmark-changed', category);
    };


    $rootScope.addBookmark = function (category, uri) {
        var bm = bookmarks(category);
        var thebiz = bm[$rootScope.namespace][category];

        // i'm going to do this the easy way
        var newVec = [];
        for (var vec_i in thebiz.vec) {
            if (thebiz.vec[vec_i] != uri) {
                newVec.push(thebiz.vec[vec_i]);
            }
        }
        newVec.push(uri);

        var newSet = {};
        for (var i in newVec) {
            newSet[newVec[i]] = i;
        }

        thebiz.vec = newVec;
        thebiz.set = newSet;

        localStorage.setItem('nsl-tree-editor.bookmarks', JSON.stringify(bm));
        $rootScope.$broadcast('nsl-tree-edit.bookmark-changed', category, uri, true);
    };

    $rootScope.removeBookmark = function (category, uri) {
        var bm = bookmarks(category);
        var thebiz = bm[$rootScope.namespace][category];

        // i'm going to do this the easy way
        var newVec = [];
        for (var vec_i1 in thebiz.vec) {
            if (thebiz.vec[vec_i1] != uri) {
                newVec.push(thebiz.vec[vec_i1]);
            }
        }

        var newSet = {};
        for (var vec_i in newVec) {
            newSet[newVec[vec_i]] = vec_i;
        }

        thebiz.vec = newVec;
        thebiz.set = newSet;

        localStorage.setItem('nsl-tree-editor.bookmarks', JSON.stringify(bm));
        $rootScope.$broadcast('nsl-tree-edit.bookmark-changed', category, uri, true);
    };


    $rootScope.clickBookmark = function (uri) {
        $location.path("/checklist").params('focus', uri);
    };
    $rootScope.clickTrashBookmark = function (uri) {
        $rootScope.removeBookmark('taxa-nodes', uri);
    };
    $rootScope.clickClearBookmarks = function () {
        $rootScope.clearBookmarks('taxa-nodes');
    };

    // bookmark gear
    $rootScope.taxanodes_bookmarks = $rootScope.getBookmarks('taxa-nodes');
    $rootScope.$on('nsl-tree-edit.bookmark-changed', function (event, category) {
        if (category == 'taxa-nodes') {
            $rootScope.taxanodes_bookmarks = $rootScope.getBookmarks('taxa-nodes');
        }
    });
    $rootScope.$on('nsl-tree-edit.namespace-changed', function () {
        $rootScope.taxanodes_bookmarks = $rootScope.getBookmarks('taxa-nodes');
    });

    if(!auth.isLoggedIn()) {
        $location.path("/login/");
    }

}];

app.controller('appbody', AppbodyController);

var NestedMessageController = ['$scope', '$rootScope', 'jsonCache', function ($scope) {
    $scope.msg = $scope.usemessage();

    $scope.linksDropdown = false;

    $scope.closeLinksDropdown = function () {
        $scope.linksDropdown = false;
    };
    $scope.toggleLinksDropdown = function () {
        $scope.linksDropdown = !$scope.linksDropdown;
    }

}];


app.controller('NestedMessage', NestedMessageController);

app.directive('nestedMessage', ['RecursionHelper', function (RecursionHelper) {
    return {
        templateUrl: pagesUrl + "/ng/utility/nestedmessage.html",
        controller: NestedMessageController,
        scope: {
            usemessage: "&"
        },
        compile: function (element) {
            return RecursionHelper.compile(element, function (scope, iElement, iAttrs, controller, transcludeFn) {
                // Define your normal link function here.
                // Alternative: instead of passing a function,
                // you can also pass an object with
                // a 'pre'- and 'post'-link function.
            });
        }
    };
}]);