var pobservices = angular.module('pob.services', [], function($httpProvider){
  
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

pobservices.directive('headerShrink', function($document) {
  var fadeAmt;

  var shrink = function(header, content, amt, max) {
    amt = Math.min(44, amt);
    fadeAmt = 1 - amt / 44;
    ionic.requestAnimationFrame(function() {
      header.style[ionic.CSS.TRANSFORM] = 'translate3d(0, -' + amt + 'px, 0)';
      for(var i = 0, j = header.children.length; i < j; i++) {
        header.children[i].style.opacity = fadeAmt;
      }
    });
  };

  return {
    restrict: 'A',
    link: function($scope, $element, $attr) {
      var starty = $scope.$eval($attr.headerShrink) || 0;
      var shrinkAmt;
      
      var header = $document[0].body.querySelector('.bar-header');
      var headerHeight = header.offsetHeight;
      
      $element.bind('scroll', function(e) {
        var scrollTop = null;
        if(e.detail){
          scrollTop = e.detail.scrollTop;
        }else if(e.target){
          scrollTop = e.target.scrollTop;
        }
        if(scrollTop > starty){
          // Start shrinking
          shrinkAmt = headerHeight - Math.max(0, (starty + headerHeight) - scrollTop);
          shrink(header, $element[0], shrinkAmt, headerHeight);
        } else {
          shrink(header, $element[0], 0, headerHeight);
        }
      });
    }
  }
});

pobservices.service('SpeechRecognize', function($rootScope){

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

pobservices.directive('tabsSwipable', ['$ionicGesture', function($ionicGesture){
  return {
    restrict: 'A',
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
    }
  };
}]);

var nodeurl = "http://192.168.0.114:8888";

pobservices.factory('User', function($http, $rootScope) {
  var email;
  var userInfo = {};
  return {
    getUserFromGoogle: function(callback) {
      var req = {
        method: 'GET',
        url: 'https://www.googleapis.com/plus/v1/people/me?access_token='+$rootScope.userInfo.access_token
      }
      $http(req).success(function(resp){ 
        email = resp.emails[0].value;
        callback();
      });
    },
    getUserFromSF: function(callback){
      var req = {
        method: 'POST',
        url: nodeurl + '/sfuser',
        data: {keyword: email}
      }
      $http(req).success(function(resp){
        if(resp && resp.length){
          userInfo = resp[0];
          callback();
        }
      }).error(function(resp){
        console.log('Failure', resp);
      });
    },
    getInfo: function(){
      return userInfo;
    }
  }
});

pobservices.factory('Teams', function($http) {
  var teams = [];

  return {
    all: function(callback) {
      var req = {
        method: 'GET',
        url: nodeurl + '/teams'
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

pobservices.factory('Trends', function($http) {
  var trends = [];

  return {
    all: function(callback) {
      var req = {
        method: 'GET',
        url: nodeurl + '/trends'
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

pobservices.factory('People', function($http) {
  var people = [];

  return {
    all: function(callback) {
      var req = {
        method: 'GET',
        url: nodeurl + '/people'
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
