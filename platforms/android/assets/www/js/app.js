angular.module('pob', ['ionic', 'pob.controllers', 'pob.services', 'ngCordovaOauth'])

.run(function ($rootScope, $state, $ionicPlatform) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      StatusBar.styleLightContent();
    }
    $rootScope.$on('$stateChangeStart', function (event, next, current) {     
      var userInfo = $rootScope.userInfo;
      if (!userInfo) {
          if (next.name !== "welcome") {
              event.preventDefault();
              $state.go('welcome');
          }
      } else if (next.name === "welcome") {
          event.preventDefault();
          $state.go(next.name);
      } 
    });
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $ionicConfigProvider.tabs.position('bottom');

  $stateProvider
  .state('welcome', {
      url: "/welcome",
      templateUrl: "templates/welcome.html",
      controller: 'welcomeCtrl'
  })
  .state('tab', {
    url: "/tab",
    templateUrl: "templates/tabs.html"
  })
  .state('tab.trends', {
    url: '/trends',
    views: {
      'tab-trends': {
        templateUrl: 'templates/tab-trends.html',
        controller: 'TrendsCtrl'
      }
    }
  })
  .state('tab.teams', {
    url: '/teams',
    views: {
      'tab-teams': {
        templateUrl: 'templates/tab-teams.html',
        controller: 'TeamsCtrl'
      }
    }
  })
  .state('tab.people', {
    url: '/people',
    views: {
      'tab-people': {
        templateUrl: 'templates/tab-people.html',
        controller: 'PeopleCtrl'
      }
    }
  })
  .state('tab.person-detail', {
    url: '/people/:personId',
    views: {
      'tab-people': {
        templateUrl: 'templates/person-detail.html',
        controller: 'PersonDetailCtrl'
      }
    }
  });

  $urlRouterProvider.otherwise('/welcome');
});
