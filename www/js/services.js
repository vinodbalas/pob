var nappservices = angular.module('napp.services', [], function($httpProvider){
  
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

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

nappservices.service('SpeechRecognize', function($rootScope){

  this.recognize = function(callback) {
      var maxMatches = 1;
      var promptString = "Speak now";
      var language = "en-in";
      window.plugins.speechrecognizer.startRecognize(function(result){
          callback(result);
      }, function(errorMessage){
          console.log("Error message: " + errorMessage);
      }, maxMatches, promptString, language);
  }

  function getSupportedLanguages() {
      window.plugins.speechrecognizer.getSupportedLanguages(function(languages){
          alert(languages);
      }, function(error){
          alert("Could not retrieve the supported languages : " + error);
      });
  }
})

nappservices.directive('tabsSwipable', ['$ionicGesture', function($ionicGesture){
  //
  // make ionTabs swipable. leftswipe -> nextTab, rightswipe -> prevTab
  // Usage: just add this as an attribute in the ionTabs tag
  // <ion-tabs tabs-swipable> ... </ion-tabs>
  //
  return {
    /*restrict: 'A',
    require: 'ionTabs',
    link: function(scope, elm, attrs, tabsCtrl){
      var onSwipeLeft = function(){
        var target = tabsCtrl.selectedIndex() + 1;
        if(target < tabsCtrl.tabs.length){
          scope.$apply(tabsCtrl.select(target));
        }
      };
      var onSwipeRight = function(){
        var target = tabsCtrl.selectedIndex() - 1;
        if(target >= 0){
          scope.$apply(tabsCtrl.select(target));
        }
      };        
      var swipeGesture = $ionicGesture.on('swipeleft', onSwipeLeft, elm).on('swiperight', onSwipeRight);
      scope.$on('$destroy', function() {
          $ionicGesture.off(swipeGesture, 'swipeleft', onSwipeLeft);
          $ionicGesture.off(swipeGesture, 'swiperight', onSwipeRight);
      });
    }*/
  };
}]);

nappservices.factory('Teams', function($http) {
  var teams = [];

  return {
    all: function(callback) {
      var req = {
        method: 'GET',
        url: 'http://192.168.0.114:8888/teams'
      }

      $http(req).success(function(resp){ 
        for(var i = 0; i < resp.length; i++){
          teams.push(resp[i]);
        }
        callback(teams);
      }).error(function(resp){ 
        console.log('Failure', resp);
      });
    },
    remove: function(chat) {
      teams.splice(teams.indexOf(chat), 1);
    },
    get: function(teamId) {
      for (var i = 0; i < teams.length; i++) {
        if (teams[i].id === parseInt(teamId)) {
          return teams[i];
        }
      }
      return null;
    }
  };
});

nappservices.factory('Trends', function($http) {
  var trends = [];

  return {
    all: function(callback) {
      var req = {
        method: 'GET',
        url: 'http://192.168.0.114:8888/trends'
      }

      $http(req).success(function(resp){ 
        for(var i = 0; i < resp.length; i++){
          trends.push(resp[i]);
        }
        callback(trends);
      }).error(function(resp){ 
        console.log('Failure', resp);
      });
    },
    remove: function(chat) {
      trends.splice(trends.indexOf(chat), 1);
    },
    get: function(trendId) {
      for (var i = 0; i < trends.length; i++) {
        if (trends[i].id === parseInt(trendId)) {
          return trends[i];
        }
      }
      return null;
    }
  };
});

nappservices.factory('People', function($http) {
  var people = [];

  return {
    all: function(callback) {
      var req = {
        method: 'GET',
        url: 'http://192.168.0.114:8888/people'
      }

      $http(req).success(function(resp){ 
        for(var i = 0; i < resp.length; i++){
          people.push(resp[i]);
        }
        callback(people);
      }).error(function(resp){ 
        console.log('Failure', resp);
      });
    },
    remove: function(person) {
      people.splice(people.indexOf(person), 1);
    },
    get: function(personId) {
      for (var i = 0; i < people.length; i++) {
        if (people[i].id === parseInt(personId)) {
          return people[i];
        }
      }
      return null;
    }
  };
});
