//= require angular
//= require recursionhelper
//= require angular-sanitize

var app = angular.module('au.org.biodiversity.nsl.tree-edit-app', ['Mark.Lagendijk.RecursionHelper', 'ngSanitize']);

var AppbodyController = function ($rootScope, $element) {
    // not using a directive to manage scope values - I'll just do this here
    $rootScope.servicesUrl = $element[0].getAttribute('data-services-url');
    $rootScope.pagesUrl = $element[0].getAttribute('data-pages-url');


    $rootScope.isLoggedIn = function() {
        return localStorage.getItem('nsl-tree-editor.loginlogout.loggedIn')=='Y';
    };

    $rootScope.getUser = function() {
        return localStorage.getItem('nsl-tree-editor.loginlogout.principal');
    };

    $rootScope.getJwt = function() {
        return localStorage.getItem('nsl-tree-editor.loginlogout.jwt');
    };

    function getBm(category) {
        if(!category || !$rootScope.namespace) return {};


        var mod = false;

        var bm = JSON.parse(localStorage.getItem('nsl-tree-editor.bookmarks'));

        if(!bm) {
            bm = new Object;
            mod = true;
        }

        if(!bm[$rootScope.namespace]) {
            bm[$rootScope.namespace] = new Object;
            mod = true;
        }

        if(!bm[$rootScope.namespace][category]) {
            bm[$rootScope.namespace][category] = new Object;
            mod = true;
        }

        if(!bm[$rootScope.namespace][category].set) {
            bm[$rootScope.namespace][category].set = new Object;
            mod = true;
        }

        if(!bm[$rootScope.namespace][category].vec) {
            bm[$rootScope.namespace][category].vec = new Array;
            mod = true;
        }

        if(mod) {
            localStorage.setItem('nsl-tree-editor.bookmarks', JSON.stringify(bm));
        }

        return bm;
    }

    $rootScope.getBookmarks = function(category) {
        var bm = getBm(category);
        return bm[$rootScope.namespace][category];
    };

    $rootScope.clearBookmarks = function(category) {
        var bm = getBm(category);
        var thebiz = bm[$rootScope.namespace][category];

        thebiz.set = new Object;
        thebiz.vec = new Array;
        localStorage.setItem('nsl-tree-editor.bookmarks', JSON.stringify(bm));
        $rootScope.$broadcast('nsl-tree-edit.bookmark-changed', category);
    };


    $rootScope.addBookmark = function(category, uri) {
        var bm = getBm(category);
        var thebiz = bm[$rootScope.namespace][category];

        // i'm going to do this the easy way
        var newVec = new Array;
        for(var i in thebiz.vec) {
            if(thebiz.vec[i] != uri) {
                newVec.push(thebiz.vec[i]);
            }
        }
        newVec.push(uri);

        var newSet = new Object();
        for(var i in newVec) {
            newSet[newVec[i]] = i;
        }

        thebiz.vec= newVec;
        thebiz.set = newSet;

        localStorage.setItem('nsl-tree-editor.bookmarks', JSON.stringify(bm));
        $rootScope.$broadcast('nsl-tree-edit.bookmark-changed', category, uri, true);
    };

    $rootScope.removeBookmark = function(category, uri) {
        var bm = getBm(category);
        var thebiz = bm[$rootScope.namespace][category];

        // i'm going to do this the easy way
        var newVec = new Array;
        for(var i in thebiz.vec) {
            if(thebiz.vec[i] != uri) {
                newVec.push(thebiz.vec[i]);
            }
        }

        var newSet = new Object();
        for(var i in newVec) {
            newSet[newVec[i]] = i;
        }

        thebiz.vec= newVec;
        thebiz.set = newSet;

        localStorage.setItem('nsl-tree-editor.bookmarks', JSON.stringify(bm));
        $rootScope.$broadcast('nsl-tree-edit.bookmark-changed', category, uri, true);
    };

};

AppbodyController.$inject = ['$rootScope', '$element'];

app.controller('appbody', AppbodyController);