angular.module('blusecur.crossing.services', [
    'ui.router',
    'angular-storage'
])

.service('CrossingService', function ($q, $http, store, $state, config) {
    return {
        getCrossings: function (accountId) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/accounts/' + accountId + '/sailings',
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
        getTracks: function (accountId) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/accounts/' + accountId + '/tracks',
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
        newCrossing: function (accountId) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/accounts/' + accountId + '/sailings',
                method: 'POST'
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
        updateCrossing: function (accountId, crossing) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/accounts/' + accountId + '/sailings/' + crossing.id,
                method: 'PUT',
                data: crossing
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
        newTrack: function (accountId, track) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/accounts/' + accountId + '/tracks',
                method: 'POST',
                data: track
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
        getTrack: function (accountId, trackId) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/accounts/' + accountId + '/tracks/' + trackId,
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
        newWaypoint: function (accountId, trackId, waypoint) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/accounts/' + accountId + '/tracks/' + trackId + '/waypoints',
                method: 'POST',
                data: waypoint
            }).then(function (response) {
                deferred.resolve(response.data);
            }, function (error) {
                deferred.reject(error.data);
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
        getTrackWaypoints: function (accountId, trackId) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/accounts/' + accountId + '/tracks/' + trackId + '/waypoints',
                method: 'GET'
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
        endTrack: function (accountId, trackId, endTrackData) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/accounts/' + accountId + '/tracks/' + trackId + '/end',
                method: 'POST',
                data: endTrackData
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
    }
});
