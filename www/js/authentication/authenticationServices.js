angular.module('blusecur.authentication.services', [
    'ui.router',
    'angular-storage'
])
    
.service('LoginService', function ($q, $http, store, $rootScope, config) {
    return {
        loginUser: function (user) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/login',
                method: 'POST',
                data: user
            }).then(function (response) {
                store.set('jwt', response.data.token);
                $rootScope.loggedIn = true;
                $rootScope.user = user.username;

                store.set('username', user.username);

                deferred.resolve(response.status);
            }, function (error) {
                deferred.reject(error.status);
            });
                      
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            }
            promise.error = function (fn) {
                promise.then(null, fn);
                return promise;
            }
            return promise;
        },
        requestResetPass: function (resetPassData) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/resetpassrequest',
                method: 'POST',
                data: resetPassData
            }).then(function (response) {
                deferred.resolve(response.status);
            }, function (error) {
                deferred.reject(error.status);
            });
                      
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            }
            promise.error = function (fn) {
                promise.then(null, fn);
                return promise;
            }
            return promise;
        },
        resetPass: function (resetPassData) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/resetpass',
                method: 'POST',
                data: resetPassData
            }).then(function (response) {
                deferred.resolve(response.status);
            }, function (error) {
                deferred.reject(error.status);
            });

            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            }
            promise.error = function (fn) {
                promise.then(null, fn);
                return promise;
            }
            return promise;
        }
    }
})

.service('SignupService', function ($q, $http, store, $state, config) {
    return {
        signupUser: function (user) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/register',
                method: 'POST',
                data: user
            }).then(function (response) {                
                deferred.resolve(response.status);
            }, function(error){
                deferred.reject(error.status);
            });
            
            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            }
            promise.error = function (fn) {
                promise.then(null, fn);
                return promise;
            }
            return promise;
        },
        sendActivationRequest: function (reactivateData) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/resendactivation',
                method: 'POST',
                data: reactivateData
            }).then(function (response) {
                deferred.resolve(response.status);
            }, function (error) {
                deferred.reject(error.status);
            });

            promise.success = function (fn) {
                promise.then(fn);
                return promise;
            }
            promise.error = function (fn) {
                promise.then(null, fn);
                return promise;
            }
            return promise;
        }
    }
});
