angular.module('pob.controllers', [])

.controller('welcomeCtrl', function ($scope, $rootScope, $state, $cordovaOauth, $ionicLoading, User) {
  $scope.gplusLogin = function () {    
    $cordovaOauth.google("460955031667-jlm0g5n1chfg9jav1qdb39e8o3dhi8v1.apps.googleusercontent.com", 
      [
        "https://www.googleapis.com/auth/plus.login",
        "https://www.googleapis.com/auth/plus.me",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "http://www.google.com/m8/feeds/"
      ]
    )
    .then(function(result) {
      $ionicLoading.show({ template: 'Loading...' });
      $rootScope.userInfo = result;
      User.getUserFromGoogle(function(){ 
        User.getUserFromSF(function(){
          $ionicLoading.hide();
          $state.go('tab');
        });
      });     
    }, function(error) {
      console.log("Error -> " + error);
    });
  };
})

.controller('homeCtrl', function($scope, User) {
  $scope.user = User.getInfo();
})

.controller('TrendsCtrl', function($scope, $ionicLoading, Trends) {
  $scope.trends = [];

  $ionicLoading.show({ template: 'Loading...' });
  Trends.all(function(result){console.log(result);
    $scope.trends = result; 
    $ionicLoading.hide();
  });
})

.controller('TeamsCtrl', function($scope, $ionicLoading, $ionicSlideBoxDelegate, Teams) {
  $scope.teams = [];

  $scope.nextSlide = function() {
    $ionicSlideBoxDelegate.next();
  }

  $ionicLoading.show({ template: 'Loading...' });
  Teams.all(function(result){
    $scope.teams = result; 
    $ionicLoading.hide();
    $ionicSlideBoxDelegate.update()
  });
})

.controller('PeopleCtrl', function($scope, $ionicLoading, SpeechRecognize, People) {
  $scope.people = [];

  $scope.recognizeSpeech = function(){
    SpeechRecognize.recognize(function(result){
        if(result){
          $scope.query = result;
          $ionicLoading.show({ template: 'Loading...' });
          People.search(result, function(res){
            $scope.people = res;
            $ionicLoading.hide();
          })
        }
    });
  }
})

.controller('PersonDetailCtrl', function($scope, $state, $stateParams, $ionicLoading, People, Trends) {
  $scope.person = People.get($stateParams.personId);
  $scope.title = "";
  $scope.desc = "";

  $scope.cancel = function(){
    $state.go('tab.people');
  }

  $scope.save = function(){
    $ionicLoading.show({ template: 'Loading...' });
    var trend = {
      owner: $scope.person.email,
      type: "user",
      title: this.title,
      desc: this.desc,
      likes: "0",
      comments: "0"
    } 
    Trends.saveTrend(trend, function(){
      $state.go('tab.people');
      $ionicLoading.hide();
    });
  }
})
