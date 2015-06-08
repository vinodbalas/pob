var oauthApp = angular.module('oauthApp.controllers', []);
oauthApp.controller('welcomeCtrl', function ($scope,$rootScope, $state, $cookieStore,$cordovaOauth) {

    
    // Google Plus Login
    $scope.gplusLogin = function () {
		
		$cordovaOauth.google("460955031667-jlm0g5n1chfg9jav1qdb39e8o3dhi8v1.apps.googleusercontent.com", 
		[
		"https://www.googleapis.com/auth/plus.login",
		"https://www.googleapis.com/auth/plus.me",
		"https://www.googleapis.com/auth/userinfo.email",
		"https://www.googleapis.com/auth/userinfo.profile",
		"http://www.google.com/m8/feeds/"
		]
		).then(function(result) {
				console.log("Response Object -> " + JSON.stringify(result));
                $rootScope.userInfo=result;
                $state.go('tabs.home');
               
			}, function(error) {
				console.log("Error -> " + error);
			});
		
		return ;
		
        var myParams = {
            // Replace client id with yours
            'clientid': '460955031667-7vqhgbrmha5ouk8pvlkk6h24hkumfa9e.apps.googleusercontent.com',
            'cookiepolicy': 'single_host_origin',
            'callback': loginCallback,
            'approvalprompt': 'force',
            'scope': 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/plus.profile.emails.read'
        };
        gapi.auth.signIn(myParams);

        function loginCallback(result) {
            if (result['status']['signed_in']) {
                var request = gapi.client.plus.people.get({'userId': 'me'});
                request.execute(function (resp) {
                    console.log('Google+ Login RESPONSE: ' + angular.toJson(resp));
                    var userEmail;
                    if (resp['emails']) {
                        for (var i = 0; i < resp['emails'].length; i++) {
                            if (resp['emails'][i]['type'] == 'account') {
                                userEmail = resp['emails'][i]['value'];
                            }
                        }
                    }
                    // store data to DB
                    var user = {};
                    user.name = resp.displayName;
                    user.email = userEmail;
                    if(resp.gender) {
                        resp.gender.toString().toLowerCase() === 'male' ? user.gender = 'M' : user.gender = 'F';
                    } else {
                        user.gender = '';
                    }
                    user.profilePic = resp.image.url;
                    $cookieStore.put('userInfo', user);
                    $state.go('dashboard');
                });
            }
        }
    };
    // END Google Plus Login

});

// Dashboard/Profile Controller
oauthApp.controller('dashboardCtrl', function ($scope, $window, $state, $cookieStore) {
    // Set user details
    $scope.user = $cookieStore.get('userInfo');
    
    // Logout user
    $scope.logout = function () {
        $cookieStore.remove("userInfo");
        $state.go('welcome');
        $window.location.reload();
    };
});