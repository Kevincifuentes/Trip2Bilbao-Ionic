angular.module('blusecur.contact.controllers', [])

.controller('ContactCtrl', function ($rootScope, ContactsService, LovsService, $ionicPopup, $state, $filter, $translate, store, jwtHelper) {

    $rootScope.data = {};
    $rootScope.org = {}

    var jwt = store.get('jwt');
    var decodedJwt = jwtHelper.decodeToken(jwt);
    var accountId = decodedJwt.accountId;

    $rootScope.accountId = accountId;

    var locale = $translate.preferredLanguage();

    LovsService.getLocCountries(locale)
        .success(function (countries) {
            $rootScope.countries = countries;
        }).error(function (error_code) {
            var alertPopup = $ionicPopup.alert({
                title: $translate.instant('SERVER_ERROR_TITLE'),
                template: $translate.instant('SERVER_ERROR_MSG')
            });
        });

    LovsService.getCapabilities(locale)
        .success(function (capabilities) {
            $rootScope.capabilities = capabilities;
            $rootScope.data.capability = $rootScope.capabilities[capabilities.length - 1];
        }).error(function (error_code) {
            var alertPopup = $ionicPopup.alert({
                title: $translate.instant('SERVER_ERROR_TITLE'),
                template: $translate.instant('SERVER_ERROR_MSG')
            });
        });

    ContactsService.getPersonContacts(accountId)
        .success(function (contacts) {
            $rootScope.contacts = contacts;

            angular.forEach($rootScope.contacts, function (contact, index) {
                contact.birthday = new Date(contact.birthday);
                LovsService.getCapabilityName(locale, contact.capability)
                     .success(function (capability) {
                         contact.capabilityName = capability.type;
                     });
                LovsService.getCountryName(locale, contact.country)
                    .success(function (response) {
                        contact.countryName = response;
                    });
            });

        }).error(function (error_code) {
            var alertPopup = $ionicPopup.alert({
                title: $translate.instant('SERVER_ERROR_TITLE'),
                template: $translate.instant('SERVER_ERROR_MSG')
            });
        });

    ContactsService.getOrganizationContacts(accountId)
        .success(function (organizations) {
            $rootScope.organizations = organizations;

            angular.forEach($rootScope.organizations, function (org, index) {
                LovsService.getCountryName(locale, org.country)
                    .success(function (response) {
                        org.countryName = response;
                    });
            });
        }).error(function (error_code) {
            var alertPopup = $ionicPopup.alert({
                title: $translate.instant('SERVER_ERROR_TITLE'),
                template: $translate.instant('SERVER_ERROR_MSG')
            });
        });
        
    $rootScope.addPersonContact = function () {
        $state.go('menu.new-person');
    }

    $rootScope.savePersonContact = function (newContactForm) {
        if (newContactForm.emergencyPhone1.$invalid || newContactForm.emergencyPhone2.$invalid || newContactForm.name.$invalid
            || newContactForm.lastname.$invalid || newContactForm.nif.$invalid || newContactForm.phone.$invalid
            || newContactForm.birthday.$invalid || newContactForm.country.$invalid) {

            var alertPopup = $ionicPopup.alert({
                title: $translate.instant('NEW_CONTACT_ERROR_TITLE'),
                template: $translate.instant('NEW_CONTACT_EMPTY_FIELDS')
            });

        } else if (newContactForm.email.$invalid) {
            var alertPopup = $ionicPopup.alert({
                title: $translate.instant('NEW_CONTACT_ERROR_TITLE'),
                template: $translate.instant('NEW_CONTACT_EMAIL_INVALID')
            });

        } else {
            ContactsService.newPersonContact($rootScope.data, accountId)
                .success(function (response) {
                    var alertPopup = $ionicPopup.alert({
                        title: $translate.instant('NEW_CONTACT_SUCCESS_TITLE'),
                        template: $translate.instant('NEW_CONTACT_SUCCESS_MSG')
                    });

                    $state.go('menu.contacts.persons');
                }).error(function (msg) {
                    var alertPopup = $ionicPopup.alert({
                        title: $translate.instant('NEW_CONTACT_ERROR_TITLE'),
                        template: $translate.instant('NEW_CONTACT_ERROR_MSG')
                    });
                });
        }
    }

    // No devuelve lo recuperado...
    //function getCapabilityName(capabilityCode) {
    //    var capabilityName = "";
    //    LovsService.getCapabilityName(locale, capabilityCode)
    //        .success(function (capability) {
    //            capabilityName = angular.copy(capability.type);
    //        });
    //    return capabilityName;
    //}
        
    $rootScope.getPersonContactInfo = function (contact) {
        $rootScope.selectedContact = contact;
        $state.go('menu.person-contact-info');
    }
    
    $rootScope.addOrganizationContact = function () {
        $state.go('menu.new-organization');
    }

    $rootScope.getOrganizationInfo = function (contact) {
        $rootScope.selectedContact = contact;
        $state.go('menu.organization-contact-info');
    }

    $rootScope.saveOrganization = function (newOrganizationForm) {
        if (newOrganizationForm.cif.$invalid || newOrganizationForm.name.$invalid || newOrganizationForm.country.$invalid) {

            var alertPopup = $ionicPopup.alert({
                title: $translate.instant('NEW_CONTACT_ERROR_TITLE'),
                template: $translate.instant('NEW_CONTACT_EMPTY_FIELDS')
            });

        } else {
            $rootScope.org.accountId = accountId;
            ContactsService.newOrganizationContact($rootScope.org, accountId)
                .success(function (response) {
                    var alertPopup = $ionicPopup.alert({
                        title: $translate.instant('NEW_CONTACT_SUCCESS_TITLE'),
                        template: $translate.instant('NEW_CONTACT_SUCCESS_MSG')
                    });

                    $state.go('menu.contacts.organizations');
                }).error(function (msg) {
                    var alertPopup = $ionicPopup.alert({
                        title: $translate.instant('NEW_CONTACT_ERROR_TITLE'),
                        template: $translate.instant('NEW_CONTACT_ERROR_MSG')
                    });
                });
        }

    }

    $rootScope.cancel = function () {
        $state.go('menu.contacts.persons');
    }

    $rootScope.cancelToOrganizations = function () {
        $state.go('menu.contacts.organizations');
    }
})

.controller('ContactInfoCtrl', function ($scope, $ionicPopup, $translate, $state, $window, ContactsService, $ionicModal) {

    var accountId = $scope.accountId;

    $ionicModal.fromTemplateUrl('edit-person-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.editPersonModal = modal;
    });
    $scope.openEditPersonModal = function () {
        $scope.selectedToEditContact = angular.copy($scope.selectedContact);
        $scope.editPersonModal.show();
    };
    $scope.closeEditPersonModal = function () {
        $scope.editPersonModal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.editPersonModal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
        // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        // Execute action
    });

    $ionicModal.fromTemplateUrl('edit-organization-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.editOrgModal = modal;
    });
    $scope.openEditOrgModal = function () {
        $scope.selectedToEditContact = angular.copy($scope.selectedContact);
        $scope.editOrgModal.show();
    };
    $scope.closeEditOrgModal = function () {
        $scope.editOrgModal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.editOrgModal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
        // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        // Execute action
    });

    $scope.updatePersonContact = function (updateContactForm) {
        if (updateContactForm.emergencyPhone1.$invalid || updateContactForm.emergencyPhone2.$invalid || updateContactForm.name.$invalid
            || updateContactForm.lastname.$invalid || updateContactForm.nif.$invalid || updateContactForm.phone.$invalid
            || updateContactForm.birthday.$invalid || updateContactForm.country.$invalid) {

            var alertPopup = $ionicPopup.alert({
                title: $translate.instant('UPDATE_CONTACT_ERROR_TITLE'),
                template: $translate.instant('UPDATE_CONTACT_EMPTY_FIELDS')
            });

        } else if (updateContactForm.email.$invalid) {
            var alertPopup = $ionicPopup.alert({
                title: $translate.instant('UPDATE_CONTACT_ERROR_TITLE'),
                template: $translate.instant('UPDATE_CONTACT_EMAIL_INVALID')
            });

        } else {

            ContactsService.updatePersonContact($scope.selectedToEditContact, accountId)
                .success(function (response) {
                    var alertPopup = $ionicPopup.alert({
                        title: $translate.instant('UPDATE_CONTACT_SUCCESS_TITLE'),
                        template: $translate.instant('UPDATE_CONTACT_SUCCESS_MSG')
                    });
                    
                    $scope.closeEditPersonModal();
                    $state.go('menu.contacts.persons');
                }).error(function (msg) {
                    var alertPopup = $ionicPopup.alert({
                        title: $translate.instant('UPDATE_CONTACT_ERROR_TITLE'),
                        template: $translate.instant('UPDATE_CONTACT_ERROR_MSG')
                    });
                });
        }        
    }

    $scope.deletePersonContact = function () {
        var contactId = $scope.selectedContact.id;

        var confirmPopup = $ionicPopup.confirm({
            title: $translate.instant('DELETE_CONTACT_TITLE'),
            template: $translate.instant('DELETE_CONTACT_CONFIRM_MSG'),
            buttons: [{ // Array[Object] (optional). Buttons to place in the popup footer.
                text: $translate.instant('CANCEL'),
                type: 'button-default'
              }, {
                  text: $translate.instant('DELETE'),
                type: 'button-positive',
                onTap: function(e) {
                  // Returning a value will cause the promise to resolve with the given value.
                    return true;
                }
              }]
        });

        confirmPopup.then(function (res) {
            if (res) {
                ContactsService.deletePersonContact(contactId, accountId)
                    .success(function (response) {
                        var alertPopup = $ionicPopup.alert({
                            title: $translate.instant('DELETE_CONTACT_SUCCESS_TITLE'),
                            template: $translate.instant('DELETE_CONTACT_SUCCESS_MSG')
                        });
                     
                        $state.go('menu.contacts.persons');
                        //$state.transitionTo('menu.contacts.persons', $state.$current.params, { reload: true });
                    }).error(function (msg) {
                        var alertPopup = $ionicPopup.alert({
                            title: $translate.instant('DELETE_CONTACT_ERROR_TITLE'),
                            template: $translate.instant('DELETE_CONTACT_ERROR_MSG')
                        });
                    });
            } 
        });
    }

    $scope.updateOrgContact = function (updateContactForm) {
        if (updateContactForm.cif.$invalid || updateContactForm.name.$invalid || updateContactForm.country.$invalid) {

            var alertPopup = $ionicPopup.alert({
                title: $translate.instant('UPDATE_CONTACT_ERROR_TITLE'),
                template: $translate.instant('UPDATE_CONTACT_EMPTY_FIELDS')
            });

        } else {

            ContactsService.updateOrgContact($scope.selectedToEditContact, accountId)
                .success(function (response) {
                    var alertPopup = $ionicPopup.alert({
                        title: $translate.instant('UPDATE_CONTACT_SUCCESS_TITLE'),
                        template: $translate.instant('UPDATE_CONTACT_SUCCESS_MSG')
                    });
                    
                    $scope.closeEditOrgModal();

                    $state.go('menu.contacts.organizations');
                }).error(function (msg) {
                    var alertPopup = $ionicPopup.alert({
                        title: $translate.instant('UPDATE_CONTACT_ERROR_TITLE'),
                        template: $translate.instant('UPDATE_CONTACT_ERROR_MSG')
                    });
                });
        }
    }

    $scope.deleteOrganizationContact = function () {
        var organizationId = $scope.selectedContact.id;

        var confirmPopup = $ionicPopup.confirm({
            title: $translate.instant('DELETE_CONTACT_TITLE'),
            template: $translate.instant('DELETE_CONTACT_CONFIRM_MSG'),
            buttons: [{ // Array[Object] (optional). Buttons to place in the popup footer.
                text: $translate.instant('CANCEL'),
                type: 'button-default'
            }, {
                text: $translate.instant('DELETE'),
                type: 'button-positive',
                onTap: function (e) {
                    // Returning a value will cause the promise to resolve with the given value.
                    return true;
                }
            }]
        });

        confirmPopup.then(function (res) {
            if (res) {
                ContactsService.deleteOrganizationContact(organizationId, accountId)
                    .success(function (response) {
                        var alertPopup = $ionicPopup.alert({
                            title: $translate.instant('DELETE_CONTACT_SUCCESS_TITLE'),
                            template: $translate.instant('DELETE_CONTACT_SUCCESS_MSG')
                        });

                        $state.go('menu.contacts.organizations');
                    }).error(function (msg) {
                        var alertPopup = $ionicPopup.alert({
                            title: $translate.instant('DELETE_CONTACT_ERROR_TITLE'),
                            template: $translate.instant('DELETE_CONTACT_ERROR_MSG')
                        });
                    });
            }
        });
    }
    
});
