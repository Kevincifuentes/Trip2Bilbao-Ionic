angular.module('blusecur.vessel.services', [
    'ui.router',
    'angular-storage'
])

.service('VesselService', function ($q, $http, store, $state, config) {
    return {
        newVessel: function (accountId, vessel) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/accounts/' + accountId + '/vessels',
                method: 'POST',
                data: vessel
            }).then(function (response) {
                deferred.resolve(response.data);
            }, function (error) {
                deferred.reject(error.data.code);
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
        getVessels: function (accountId) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/accounts/' + accountId + '/vessels',
                method: 'GET'
            }).then(function (response) {
                deferred.resolve(response.data);
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
        deleteVessel: function (accountId, vesselId) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/accounts/' + accountId + '/vessels/' + vesselId,
                method: 'DELETE'
            }).then(function (response) {
                deferred.resolve(response.data);
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
        getVessel: function (accountId, vesselId) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/accounts/' + accountId + '/vessels/' + vesselId,
                method: 'GET'
            }).then(function (response) {
                deferred.resolve(response.data);
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