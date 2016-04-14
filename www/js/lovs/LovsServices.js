angular.module('blusecur.lovs.services', [
    'ui.router',
    'angular-storage'
])

.service('LovsService', function ($q, $http, config) {
    return {
        getCapabilities: function () {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/lovs/capabilities',
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
        getCapabilities: function (locale) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/lovs/capabilities/' + locale,
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
        getCapabilityName: function (locale, code) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/lovs/capabilities/' + locale + "/" + code,
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
        getCountries: function () {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/lovs/countries',
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
         getLocCountries: function (locale) {
             var deferred = $q.defer();
             var promise = deferred.promise;

             $http({
                 url: config.API_URL + '/lovs/countries/'+locale,
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
         getCountryName: function (locale, conuntrycode) {
             var deferred = $q.defer();
             var promise = deferred.promise;

             $http({
                 url: config.API_URL + '/lovs/countries/' + locale + '/' + conuntrycode,
                 method: 'GET'
             }).then(function (response) {
                 deferred.resolve(response.data.name);
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
         getRoles: function () {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/lovs/crews/roles',
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
         getLocStatusList: function (locale) {
             var deferred = $q.defer();
             var promise = deferred.promise;

             $http({
                 url: config.API_URL + '/lovs/vessels/status/'+locale,
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
         getLocStatus: function (locale, code) {
             var deferred = $q.defer();
             var promise = deferred.promise;

             $http({
                 url: config.API_URL + '/lovs/vessels/status/'+locale +'/'+ code,
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
         getLocVesselTypesList: function (locale) {
             var deferred = $q.defer();
             var promise = deferred.promise;

             $http({
                 url: config.API_URL + '/lovs/vessels/types/' + locale,
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
         getLocVesselType: function (locale, code) {
             var deferred = $q.defer();
             var promise = deferred.promise;

             $http({
                 url: config.API_URL + '/lovs/vessels/types/' + locale + '/' + code,
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
         getPorts: function () {
             var deferred = $q.defer();
             var promise = deferred.promise;

             $http({
                 url: config.API_URL + '/lovs/ports',
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
         getTypeName: function (locale, typecode) {
             var deferred = $q.defer();
             var promise = deferred.promise;

             $http({
                 url: config.API_URL + '/lovs/vessels/types/' + locale + '/' + typecode,
                 method: 'GET'
             }).then(function (response) {
                 deferred.resolve(response.data.type);
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
