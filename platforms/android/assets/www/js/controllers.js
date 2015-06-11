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
      $ionicLoading.show({ template: '<ion-spinner></ion-spinner>' });
      $rootScope.userInfo = result;
      User.getUserFromGoogle(function(email){ 
        User.getUserFromSF(email, function(){
          $ionicLoading.hide();
          $state.go('tab');
        });
      });     
    }, function(error) {
      console.log("Error -> " + error);
    });
  };
})

.controller('TrendsCtrl', function($scope, $rootScope, $ionicLoading, $ionicModal, SpeechRecognize, Trends) {
  $scope.user = $rootScope.userInfo;
  $scope.trends = [];

  $ionicLoading.show({ template: '<ion-spinner></ion-spinner>' });
  Trends.all(function(result){
    $scope.trends = result; 
    $ionicLoading.hide();
  });

  $ionicModal.fromTemplateUrl('comments.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function(trendId) {
    $scope.trend = Trends.get(trendId);
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  $scope.saveComment = function(trendId){
    $ionicLoading.show({ template: '<ion-spinner></ion-spinner>' });
    Trends.saveComment(trendId, this.comment, function(){
      $scope.closeModal();
      $ionicLoading.hide();
    });
  }

  $scope.likeTrend = function(trendId){
    $ionicLoading.show({ template: '<ion-spinner></ion-spinner>' });
    Trends.likeTrend(trendId, function(){
      $ionicLoading.hide();
    });
  }

  $scope.recognizeSpeech = function(){
    var me = this;
    SpeechRecognize.recognize(function(result){
        if(result){ 
          me.comment = result;
          me.$apply();
        }
    });
  }
})

.controller('TeamsCtrl', function($scope, $rootScope, $ionicLoading, $ionicSlideBoxDelegate, Teams) {
  $scope.user = $rootScope.userInfo;
  $scope.teams = [];
  
  $ionicLoading.show({ template: '<ion-spinner></ion-spinner>' });
  Teams.all(function(result){
    $scope.teams = result; 
    $ionicLoading.hide();
    $ionicSlideBoxDelegate.update()
  });

  $scope.nominatePerson = function(userId){

  }
})

.controller('PeopleCtrl', function($scope, $rootScope, $ionicLoading, SpeechRecognize, People) {
  $scope.user = $rootScope.userInfo;
  $scope.people = [];

  $scope.search = function(){
    if(this.query){
      $ionicLoading.show({ template: '<ion-spinner></ion-spinner>' });
      People.search(this.query, function(res){
        $scope.people = res;
        $ionicLoading.hide();
      })
    }
  }
  $scope.recognizeSpeech = function(){
    var me = this;
    SpeechRecognize.recognize(function(result){
        if(result){ 
          me.query = result;
          me.$apply();
          me.search();
        }
    });
  }
})

.controller('PersonDetailCtrl', function($scope, $rootScope, $state, $stateParams, $ionicLoading, People, Teams, Trends) {
  $scope.user = $rootScope.userInfo;
  $scope.inp = { title: "", desc: "" };

  $scope.isTeam = false;
  if($stateParams.personId.match("~team")){
    $scope.isTeam = true;
  }

  if($scope.isTeam){
    $scope.person = Teams.getMember($stateParams.personId.replace("~team", ""));
  }else{
    $scope.person = People.get($stateParams.personId);
  }

  $scope.cancel = function(){
    if($scope.isTeam){
      $state.go('tab.teams');
    }else{
      $state.go('tab.people');
    }
  }
  $scope.save = function(){
    $ionicLoading.show({ template: '<ion-spinner></ion-spinner>' });
    var trend = {
      owner: $scope.person.email,
      type: "user",
      title: $scope.inp.title,
      desc: $scope.inp.desc,
      likes: "0",
      comments: [],
      nominatedBy: $rootScope.userInfo.email
    } 
    Trends.saveTrend(trend, function(){
      if($scope.isTeam){
        $state.go('tab.teams');
      }else{
        $state.go('tab.people');
      }
      $ionicLoading.hide();
    });
  }
});