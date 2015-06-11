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
  return {
    getUserFromGoogle: function(callback) {
      var req = {
        method: 'GET',
        url: 'https://www.googleapis.com/plus/v1/people/me?access_token=' + $rootScope.userInfo.access_token
      }
      $http(req).success(function(resp){
        callback(resp.emails[0].value);
      });
    },
    getUserFromSF: function(email, callback){
      var req = {
        method: 'GET',
        url: nodeurl + '/people?keyword=' + email
      }
      $http(req).success(function(resp){
        if(resp && resp.length){
          for(var key in resp[0]){
            $rootScope.userInfo[key] = resp[0][key];
          }
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
    },
    getMember: function(memberId){
      for (var i = 0; i < teams.length; i++) {
        var team = teams[i];
        for (var j = 0; j < team.members.length; j++) {
          if (team.members[j].email === memberId) {
            return team.members[j];
          }
        }
      }
    }
  };
});

pobservices.factory('Trends', function($http, $rootScope) {
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
        if (trends[i]._id === trendId) {
          return trends[i];
        }
      }
      return null;
    }, 
    saveTrend: function(trend, callback){
      var req = {
        method: 'POST',
        url: nodeurl + '/savetrend',
        data: trend
      }
      $http(req).success(function(resp){ 
        for(var i = 0; i < resp.length; i++){
          trends.push(resp[i]);
        }
        callback();
      }).error(function(resp){ 
        console.log('Failure', resp);
      });
    },
    saveComment: function(trendId, comment, callback){
      var req = {
        method: 'POST',
        url: nodeurl + '/savecomment',
        data: {trendId: trendId, comment: comment}
      }
      var me = this;
      $http(req).success(function(res){ 
        me.update(res, callback);
      }).error(function(resp){ 
        console.log('Failure', resp);
      });
    },
    likeTrend: function(trendId, callback){
      var req = {
        method: 'POST',
        url: nodeurl + '/liketrend',
        data: { trendId: trendId, userId: $rootScope.userInfo && $rootScope.userInfo.email }
      }
      var me = this;
      $http(req).success(function(res){ 
        me.update(res, callback);
      }).error(function(resp){ 
        console.log('Failure', resp);
      });
    }, 
    update: function(res, callback){
      if(res && res.length){
        var trend = this.get(res[0]._id);
        if(trend){
          for(var key in trend){
            if(res[0][key]){
              trend[key] = res[0][key];
            }
          }
        }
      }
      callback();
    }
  };
});

pobservices.factory('People', function($http) {
  var people = [];

  return {
    get: function(email) {
      for (var i = 0; i < people.length; i++) {
        if (people[i].email === email) {
          return people[i];
        }
      }
      return null;
    },
    remove: function(person) {
      people.splice(people.indexOf(person), 1);
    },
    search: function(keyword, callback) {
      var req = {
        method: 'GET',
        url: nodeurl + '/people?keyword=' + keyword
      }
      $http(req).success(function(resp){ 
        people = [];
        for(var i = 0; i < resp.length; i++){
          people.push(resp[i]);
        }
        callback(people);
      }).error(function(resp){ 
        console.log('Failure', resp);
      });
    }
  };
});
