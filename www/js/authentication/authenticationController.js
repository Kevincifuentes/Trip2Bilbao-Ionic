angular.module('blusecur.authentication.controllers', [])

.controller('LoginCtrl', function ($scope, LoginService, $ionicPopup, $state, $translate, $ionicModal) {
    $scope.data = {};
    $scope.resetPassData = {};

    $scope.login = function () {
        if ($scope.data.username == null || $scope.data.password == null || $scope.data.username == "" || $scope.data.password == "") {
            var alertPopup = $ionicPopup.alert({
                title: $translate.instant('LOGIN_ERROR_TITLE'),
                template: $translate.instant('LOGIN_EMPTY_FIELDS')
            });
        } else {
            LoginService.loginUser($scope.data)
                .success(function (data) {
                    $scope.data = {};
                    $state.go('menu.home');
                }).error(function (error) {
                    var alertPopup = $ionicPopup.alert({
                        title: $translate.instant('LOGIN_ERROR_TITLE'),
                        template: $translate.instant('LOGIN_ERROR_MSG')
                    });
                });
        }
    }

    $ionicModal.fromTemplateUrl('password-reset-request-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.resetPassModal = modal;
    });
    $scope.openResetPassModal = function () {
        $scope.resetPassModal.show();
    };
    $scope.closeResetPassModal = function () {
        $scope.resetPassModal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.resetPassModal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
        // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        // Execute action
    });

    $scope.requestResetPass = function () {
        LoginService.requestResetPass($scope.resetPassData)
                .success(function (response) {
                    var alertPopup = $ionicPopup.alert({
                        title: $translate.instant('REQUEST_RESET_PASS_SUCCESS_TITLE'),
                        template: $translate.instant('REQUEST_RESET_PASS_SUCCESS_MSG')
                    });

                    $scope.closeResetPassModal();
                    //$state.transitionTo('menu.contacts.persons', $state.$current.params, { reload: true });
                }).error(function (msg) {
                    var alertPopup = $ionicPopup.alert({
                        title: $translate.instant('REQUEST_RESET_PASS_ERROR_TITLE'),
                        template: $translate.instant('REQUEST_RESET_PASS_ERROR_MSG')
                    });
                });
    }
})

.controller('SignupCtrl', function ($scope, SignupService, $ionicPopup, $state, $translate, $ionicModal) {
    $scope.data = {};
    $scope.reactivateData = {};

    $ionicModal.fromTemplateUrl('account-activation-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.activationModal = modal;
    });
    $scope.openActivationModal = function () {
        $scope.activationModal.show();
    };
    $scope.closeActivationModal = function () {
        $scope.activationModal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.activationModal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
        // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        // Execute action
    });

    $scope.sendActivationRequest = function(){
        SignupService.sendActivationRequest($scope.reactivateData)
                .success(function (response) {
                    var alertPopup = $ionicPopup.alert({
                        title: $translate.instant('ACTIVATION_REQUEST_CONFIRM_TITLE'),
                        template: $translate.instant('ACTIVATION_REQUEST_SEND_SUCCESS')
                    });
                    $scope.closeActivationModal();
                    //$state.go('login');
                }).error(function (msg) {
                    var alertPopup = $ionicPopup.alert({
                        title: $translate.instant('ACTIVATION_REQUEST_CONFIRM_TITLE'),
                        template: $translate.instant('ACTIVATION_REQUEST_SEND_ERROR')
                    });
                });
    }

    $scope.save = function (signupForm) {
        if (signupForm.username.$invalid || signupForm.password.$invalid || signupForm.password2.$invalid
            || signupForm.name.$invalid || signupForm.lastname.$invalid) {
           
            var alertPopup = $ionicPopup.alert({
                title: $translate.instant('SIGNUP_ERROR_TITLE'),
                template: $translate.instant('SIGNUP_EMPTY_FIELDS')
            });            

        } else if (signupForm.email.$invalid) {
            var alertPopup = $ionicPopup.alert({
                title: $translate.instant('SIGNUP_ERROR_TITLE'),
                template: $translate.instant('SIGNUP_EMAIL_INVALID')
            });
        
        } else if (signupForm.password.$viewValue != signupForm.password2.$viewValue) {
            var alertPopup = $ionicPopup.alert({
                title: $translate.instant('SIGNUP_ERROR_TITLE'),
                template: $translate.instant('SIGNUP_PASSWORDS_NOT_EQUAL')
            });
        } else {

            SignupService.signupUser($scope.data)
                .success(function (response) {
                    var alertPopup = $ionicPopup.alert({
                        title: $translate.instant('SIGNUP_SUCCESS_TITLE'),
                        template: $translate.instant('SIGNUP_SUCCESS_MSG')
                    });
                    $state.go('login');
                }).error(function (msg) {
                    var alertPopup = $ionicPopup.alert({
                        title: $translate.instant('SIGNUP_ERROR_TITLE'),
                        template: $translate.instant('SIGNUP_ERROR_MSG')
                    });
                });            
        }
    }
});
