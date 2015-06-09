angular.module('pob.controllers', [])

.controller('welcomeCtrl', function ($scope, $rootScope, $state, $cordovaOauth, User) {
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
      $rootScope.userInfo = result;
      User.getUserFromGoogle(function(){ 
        User.getUserFromSF(function(){
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
  console.log($scope.user);
})

.controller('TrendsCtrl', function($scope, Trends) {
  $scope.trends = [];

  Trends.all(function(result){
    $scope.trends = result; 
  });
})

.controller('TeamsCtrl', function($scope, SpeechRecognize, Teams) {
  $scope.teams = [];

  $scope.recognizeSpeech = function(){
    SpeechRecognize.recognize(function(result){
        $scope.query = result;
        $scope.$apply(); 
    });
  }
  Teams.all(function(result){
    $scope.teams = result; 
  });
})

.controller('PeopleCtrl', function($scope, SpeechRecognize, People) {
  $scope.people = [];

  $scope.recognizeSpeech = function(){
    SpeechRecognize.recognize(function(result){
        $scope.query = result;
        $scope.$apply(); 
    });
  }
  People.all(function(result){
    $scope.people = result; 
  });
})

.controller('PersonDetailCtrl', function($scope, $stateParams, People) {
  $scope.person = People.get($stateParams.personId);
})
