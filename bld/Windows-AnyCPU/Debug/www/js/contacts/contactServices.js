angular.module('blusecur.contact.services', [
    'ui.router',
    'angular-storage'
])

.service('ContactsService', function ($q, $http, config) {
    return {
        getAccountInfo: function (accountId){
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/accounts/' + accountId,
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
        getPersonContacts: function (accountId) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/accounts/' + accountId + '/contacts',
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
        getOrganizationContacts: function (accountId) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/accounts/' + accountId + '/organizations',
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
        newPersonContact: function (contact, accountId) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/accounts/' + accountId + '/contacts',
                method: 'POST',
                data: contact
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
        updatePersonContact: function (contact, accountId) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/accounts/' + accountId + '/contacts/'+ contact.id,
                method: 'PUT',
                data: contact
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
        newOrganizationContact: function (org, accountId) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/accounts/' + accountId + '/organizations',
                method: 'POST',
                data: org
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
        updateOrgContact: function (contact, accountId) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/accounts/' + accountId + '/organizations/' + contact.id,
                method: 'PUT',
                data: contact
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
        deletePersonContact: function (contactId, accountId) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/accounts/' + accountId + '/contacts/' + contactId,
                method: 'DELETE'
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
        deleteOrganizationContact: function (organizationId, accountId) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/accounts/' + accountId + '/organizations/' + organizationId,
                method: 'DELETE'
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
        updateAccount: function (accountId, accountData) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            $http({
                url: config.API_URL + '/accounts/' + accountId,
                method: 'PUT',
                data: accountData
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

