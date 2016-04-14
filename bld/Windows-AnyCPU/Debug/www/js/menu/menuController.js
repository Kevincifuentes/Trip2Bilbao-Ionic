angular.module('blusecur.menu.controllers', [])

.controller('MenuCtrl', function ($scope, $state, $ionicModal, $timeout, store, jwtHelper, ContactsService, $ionicPopup, $translate, $ionicActionSheet, LoginService) {

    $scope.username = store.get('username');

    var jwt = store.get('jwt');
    var decodedJwt = jwtHelper.decodeToken(jwt);
    var accountId = decodedJwt.accountId;

    $scope.passData = {};

    ContactsService.getAccountInfo(accountId)
        .success(function (account) {
            $scope.account = account;
            store.set('account', account);
        }).error(function (error_code) {
            var alertPopup = $ionicPopup.alert({
                title: $translate.instant('SERVER_ERROR_TITLE'),
                template: $translate.instant('SERVER_ERROR_MSG')
            });
        });
    
    $scope.logout = function () {
        var confirmPopup = $ionicPopup.confirm({
            title: $translate.instant('LOGOUT_MSG_TITLE'),
            template: $translate.instant('LOGOUT_CONFIRM_MSG'),
            buttons: [{ // Array[Object] (optional). Buttons to place in the popup footer.
                text: $translate.instant('CANCEL'),
                type: 'button-default'
            }, {
                text: $translate.instant('OK'),
                type: 'button-positive',
                onTap: function (e) {
                    // Returning a value will cause the promise to resolve with the given value.
                    return true;
                }
            }]
        });

        confirmPopup.then(function (res) {
            if (res) {
                store.remove('jwt');
                store.remove('username');

                $state.go('login');
            }
        });
    }
    
    $scope.manageiAd = function () {
        //Show the action sheet
        var hideSheet = $ionicActionSheet.show({
        	//Here you can add some more buttons
        	buttons: [
        	{ text: $translate.instant('EDIT_PROFILE_DATA') },
        	{ text: $translate.instant('EDIT_PASSWORD') }
        	],
        	//destructiveText: 'Remove Ads',
        	titleText: $translate.instant('SELECT_PROFILE_EDITION_ACTION'),
        	cancelText: $translate.instant('CANCEL'),
        	cancel: function() {
        		// add cancel code..
        	},
        	//destructiveButtonClicked: function() {
        	//	console.log("removing ads");
        	//	iAd.removeAds();
        	//	return true;
        	//},
        	buttonClicked: function(index, button) {
        	    if (button.text == $translate.instant('EDIT_PROFILE_DATA'))
        		{
        			//console.log("show iAd banner");
        		    //iAd.showBanner();
        	        $scope.openUpdateProfileModal();
        		}
        	    if (button.text == $translate.instant('EDIT_PASSWORD'))
        		{
        			//console.log("show iAd interstitial");
        	        //iAd.showInterstitial();
        	        $scope.openUpdatePasswordModal();
        		}
        		return true;
        	}
        });
    }
    
    $ionicModal.fromTemplateUrl('update-password-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.updatePasswordModal = modal;
    });
    $scope.openUpdatePasswordModal = function () {
        $scope.passData = {};
        $scope.updatePasswordModal.show();
    };
    $scope.closeUpdatePasswordModal = function () {
        $scope.updatePasswordModal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.updatePasswordModal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
        // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        // Execute action
    });

    $scope.updatePassword = function () {
        $scope.passData.token = jwt;
        LoginService.resetPass($scope.passData)
           .success(function (account) {
               var alertPopup = $ionicPopup.alert({
                   title: $translate.instant('PASSWORD_UPDATE_SUCCESS_TITLE'),
                   template: $translate.instant('PASSWORD_UPDATE_SUCCESS_MSG')
               });
           }).error(function (error_code) {
               var alertPopup = $ionicPopup.alert({
                   title: $translate.instant('SERVER_ERROR_TITLE'),
                   template: $translate.instant('SERVER_ERROR_MSG')
               });
           });
    }

    $ionicModal.fromTemplateUrl('update-profile-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.updateProfileModal = modal;
    });
    $scope.openUpdateProfileModal = function () {
        $scope.updateProfileModal.show();
    };
    $scope.closeUpdateProfileModal = function () {
        $scope.updateProfileModal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.updateProfileModal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
        // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        // Execute action
    });

    $scope.updateProfile = function () {
        ContactsService.updateAccount(accountId, $scope.account)
            .success(function (response) {
                var alertPopup = $ionicPopup.alert({
                    title: $translate.instant('PROFILE_UPDATED_TITLE'),
                    template: $translate.instant('PROFILE_UPDATED_MSG')
                });
                $scope.closeUpdateProfileModal();
            }).error(function (error_code) {
                var alertPopup = $ionicPopup.alert({
                    title: $translate.instant('SERVER_ERROR_TITLE'),
                    template: $translate.instant('SERVER_ERROR_MSG')
                });
            });
    }
});
