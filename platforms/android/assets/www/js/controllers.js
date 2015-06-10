angular.module('pob.controllers', [])

.controller('welcomeCtrl', function ($scope, $rootScope, $state, $cordovaOauth, User) {
  $scope.gplusLogin = function () {    
    /*$cordovaOauth.google("460955031667-jlm0g5n1chfg9jav1qdb39e8o3dhi8v1.apps.googleusercontent.com", 
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
    });*/
  };
})

.controller('homeCtrl', function($scope, User) {
  //$scope.user = User.getInfo();
})

.controller('TrendsCtrl', function($scope, Trends) {
  $scope.trends = [];

  Trends.all(function(result){console.log(result);
    $scope.trends = result; 
  });
})

.controller('TeamsCtrl', function($scope, Teams) {
  $scope.teams = [];

  Teams.all(function(result){
    $scope.teams = result; 
  });
})

.controller('PeopleCtrl', function($scope, SpeechRecognize, People) {
  $scope.people = [];

  $scope.recognizeSpeech = function(){
    SpeechRecognize.recognize(function(result){
        if(result){
          $scope.query = result;
          People.search(result, function(res){
            $scope.people = res;
          })
        }
    });
  }
})

.controller('PersonDetailCtrl', function($scope, $stateParams, People) {
  console.log($stateParams.personId);
  $scope.person = People.get($stateParams.personId);
  console.log($scope.person);
})
