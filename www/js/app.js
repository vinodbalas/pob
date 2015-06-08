// App.js
var oauthApp = angular.module('oauthApp', ['ngCookies', 'ionic','ngCordovaOauth', 'oauthApp.controllers'],function($httpProvider)
 {
  // Use x-www-form-urlencoded Content-Type
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

  /**
   * The workhorse; converts an object to x-www-form-urlencoded serialization.
   * @param {Object} obj
   * @return {String}
   */ 
  var param = function(obj) {
    var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
      
    for(name in obj) {
      value = obj[name];
        
      if(value instanceof Array) {
        for(i=0; i<value.length; ++i) {
          subValue = value[i];
          fullSubName = name + '[' + i + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value instanceof Object) {
        for(subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value !== undefined && value !== null)
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
    }
      
    return query.length ? query.substr(0, query.length - 1) : query;
  };

  // Override $http service's default transformRequest
  $httpProvider.defaults.transformRequest = [function(data) {
    return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
  }];
});

oauthApp.run(function ($rootScope, $cookieStore, $state,$ionicPlatform) {

    $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
    // Check login session
    $rootScope.$on('$stateChangeStart', function (event, next, current) {
        
        var userInfo = $rootScope.userInfo;
        if (!userInfo) {
            // user not logged in | redirect to login
            if (next.name !== "welcome") {
                // not going to #welcome, we should redirect now
                event.preventDefault();
                $state.go('welcome');
            }
        } else if (next.name === "welcome") {
            event.preventDefault();
            $state.go(next.name);
        }
    });
})
.filter('searchContacts', function(){
  return function (items, query) {
    var filtered = [];
    var letterMatch = new RegExp(query, 'i');
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (query) {
        if (letterMatch.test(item.title.substring(0, query.length))) {
          filtered.push(item);
        }
      } else {
        filtered.push(item);
      }
    }
    return filtered;
  };
})



.controller('testController', function($state,$rootScope,$scope,$http, $stateParams) {
var trends =[];
  var req = {
    method: 'GET',
    url: 'https://www.googleapis.com/plus/v1/people/me?access_token='+$rootScope.userInfo.access_token,
    headers: {
      //'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
    },
  
    }

$http(req).success(function(resp){ 
    console.log('Success', resp);
    var emailId = resp.emails[0].value;

      var req1 = {
        method: 'GET',
        url: 'http://192.168.0.114:8888/teams',
        headers: {
          //'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        },
      
      }

      $http(req1).success(function(resp){ 
        console.log('Success', resp);
      }).error(function(resp){ 
        console.log('Failure', resp);
      })

      var req2 = {
        method: 'GET',
        url: 'http://192.168.0.114:8888/trends',
        headers: {
          //'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        },
      
      }

      $http(req2).success(function(resp){ 
        $scope.trends = resp;
        console.log('Success', resp);

      }).error(function(resp){ 
        console.log('Failure', resp);
      })

      var req3 = {
        method: 'POST',
        url: 'http://192.168.0.114:8888/sfuser',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        },
        data: {keyword: emailId}
      }

      $http(req3).success(function(resp){ 
        console.log('Success', resp);
        $rootScope.loggedInUserName = resp[0].displayName;
        $rootScope.managerName = resp[0].managerName;
        $rootScope.userTitle = resp[0].title;
         $rootScope.userPhoto = resp[0].photo.standardEmailPhotoUrl;


      }).error(function(resp){ 
        console.log('Failure', resp);
      })


  }).error(function(resp){ 
    console.log('Failure', resp);
  })




    $scope.users = [
    { title: 'Sumit', id: "'Rockstar'",link:"http://bansal.ac.in/images/th_login_icon.png" },
    { title: 'Tejasvi', id: "'Great Contribution'",link:"http://smartshopee.biz/images/login-big-icon.png" },
    { title: 'Ashwini', id: "Awesome work",link:"http://www.soundbitesrestaurant.com/admin/images/login-icon.jpg" },
    { title: 'Sumit', id: "'Rockstar'",link:"http://bansal.ac.in/images/th_login_icon.png" },
    { title: 'Tejasvi', id: "'Great Contribution'",link:"http://smartshopee.biz/images/login-big-icon.png" },
    { title: 'Ashwini', id: "'Awesome work'",link:"http://www.soundbitesrestaurant.com/admin/images/login-icon.jpg" },
    { title: 'Sumit', id: "'Rockstar'",link:"http://bansal.ac.in/images/th_login_icon.png" },
    { title: 'Tejasvi', id: "'Great Contribution'",link:"http://smartshopee.biz/images/login-big-icon.png" },
    { title: 'Ashwini', id: "'Awesome work'",link:"http://www.soundbitesrestaurant.com/admin/images/login-icon.jpg" },
    { title: 'Sumit', id: "'Rockstar'",link:"http://bansal.ac.in/images/th_login_icon.png" },
    { title: 'Tejasvi', id: "'Great Contribution'",link:"http://smartshopee.biz/images/login-big-icon.png" },
    { title: 'Ashwini', id: "'Awesome work'",link:"http://www.soundbitesrestaurant.com/admin/images/login-icon.jpg" },
    
    { title: 'Prakash', id: "Suppotive Player",link:"http://www.veryicon.com/icon/png/Application/iPhonica%20Vol.%202/Contact.png" }],

      $scope.about = function(){
        $state.go('aboutPage', {});
       //alert("item cicked");
   }
   $scope.data = {
    isLoading: false
  }
      $scope.onDrag = function(){

     
     if($scope.data.isLoading == false)
     {
     $scope.data.isLoading = true;}
     else
       {
       $scope.data.isLoading = false;
       }
     
   }
})

.controller('loginController', function($state,$scope, $stateParams, $http) {
   $scope.login = function(){
              $state.go('page6', {});
       
  }
  

})
// Routes
oauthApp.config(function ($stateProvider, $urlRouterProvider) {
    // setup states
    $stateProvider
            .state('welcome', {
                url: "/welcome",
                templateUrl: "partials/welcome.html",
                controller: 'welcomeCtrl'
            })
            .state('dashboard', {
                url: "/dashboard",
                templateUrl: "partials/dashboard.html",
                controller: "dashboardCtrl"
            })
          .state('page6', {
          url: '/page6',
          templateUrl: 'templates/page6.html',
          controller : 'testController'
          })

   
    
    .state('home', {
      url: '/home',
      templateUrl: 'templates/home.html',
       controller : 'loginController'
    })
    .state('signup', {
      url: '/signup',
      templateUrl: 'templates/signup.html',
       controller : 'loginController'
    })
    .state('aboutPage', {
      url: '/aboutPage',
      templateUrl: 'templates/aboutPage.html',
       controller : 'loginController'
    })
    .state('tabs', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html"
    })
    .state('tabs.home', {
      url: "/home",
      views: {
        'home-tab': {
          templateUrl: "templates/home.html",
          controller: 'HomeTabCtrl'
        }
      }
    })
    .state('tabs.about', {
      url: "/about",
      views: {
        'about-tab': {
          templateUrl: "templates/page6.html"
        }
      }
    })
    // default route           
    $urlRouterProvider.otherwise("/welcome");

});