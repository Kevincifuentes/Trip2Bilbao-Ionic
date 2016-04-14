angular.module('blusecur.vessel.controllers', [])

.controller('VesselCtrl', function ($rootScope, $ionicPopup, $state, $translate, store, jwtHelper, $ionicModal, LovsService, VesselService, ContactsService) {
    $rootScope.data = {};

    $rootScope.data.shipowners = {};
    $rootScope.data.shipowners.organizations = [];
    $rootScope.data.shipowners.people = [];

    $rootScope.ownersSet = false;
        
    $rootScope.selectedContacts = [];
    $rootScope.selectedOrgs = [];
    $rootScope.selected = {};
    $rootScope.selected.selectedOwnerType = null;
    $rootScope.selected.selectedPersonOwner = null;
    $rootScope.selected.selectedOrgOwner = null;

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

    LovsService.getLocStatusList(locale)
        .success(function (statuslist) {
            $rootScope.vesselStatusList = statuslist;
        }).error(function (error_code) {
            var alertPopup = $ionicPopup.alert({
                title: $translate.instant('SERVER_ERROR_TITLE'),
                template: $translate.instant('SERVER_ERROR_MSG')
            });
        });

    LovsService.getLocVesselTypesList(locale)
        .success(function (types) {
            $rootScope.vesselTypes = types;
        }).error(function (error_code) {
            var alertPopup = $ionicPopup.alert({
                title: $translate.instant('SERVER_ERROR_TITLE'),
                template: $translate.instant('SERVER_ERROR_MSG')
            });
        });

    LovsService.getPorts()
        .success(function (ports) {
            $rootScope.ports = ports;
        }).error(function (error_code) {
            var alertPopup = $ionicPopup.alert({
                title: $translate.instant('SERVER_ERROR_TITLE'),
                template: $translate.instant('SERVER_ERROR_MSG')
            });
        });

    $rootScope.getPort = function (portId) {
        var portFound = null;
        angular.forEach($rootScope.port, function (port, index) {
            if(port.id == portId){
                portFound = angular.copy(port);
            }
        });
        return port;
    }

    //$rootScope.getContact = function (contactId) {
    //    var contactFound = null;
    //    var contactList = angular.copy($rootScope.contactsCopy);
    //    angular.forEach(contactList, function (contact, index) {
    //        if (contact.id == contactId) {
    //            contactFound = angular.copy(contact);
    //        }
    //    });
    //    return contactFound;
    //}

    VesselService.getVessels(accountId)
        .success(function (vessels) {
            $rootScope.vessels = vessels;

            angular.forEach($rootScope.vessels, function (vessel, index) {
                LovsService.getLocStatus(locale, vessel.status)
                     .success(function (status) {
                         vessel.statusName = status.name;
                     });

                LovsService.getCountryName(locale, vessel.country)
                    .success(function (response) {
                        vessel.countryName = response;
                    });

                LovsService.getTypeName(locale, vessel.type)
                    .success(function (response) {
                        vessel.typeName = response;
                    });
                
                if (vessel.basePortId != null) {
                    var basePort = $rootScope.getPort(vessel.basePortId);
                    vessel.basePortName = basePort.name;
                }
                if (vessel.locationPortId != null) {
                    var locationPort = $rootScope.getPort(vessel.locationPortId);
                    vessel.locationPortName = locationPort.name;
                }
            });
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

            $rootScope.contactsCopy = angular.copy($rootScope.contacts);

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

            $rootScope.organizationsCopy = angular.copy($rootScope.organizations);
        }).error(function (error_code) {
            var alertPopup = $ionicPopup.alert({
                title: $translate.instant('SERVER_ERROR_TITLE'),
                template: $translate.instant('SERVER_ERROR_MSG')
            });
        });


    $rootScope.addVessel = function () {
        $rootScope.contacts = angular.copy($rootScope.contactsCopy);
        $rootScope.organizations = angular.copy($rootScope.organizationsCopy);

        $state.go('menu.new-vessel');
    }

    $ionicModal.fromTemplateUrl('select-owner-modal.html', {
        scope: $rootScope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $rootScope.selectOwnerModal = modal;
    });
    $rootScope.openOwnerModal = function () {
        $rootScope.selected.selectedOwnerType = "";
        $rootScope.selected.selectedPersonOwner = null;
        $rootScope.selected.selectedOrgOwner = null;

        $rootScope.selectOwnerModal.show();
    };
    $rootScope.closeOwnerModal = function () {
        $rootScope.selectOwnerModal.hide();
    };
    //Cleanup the modal when we're done with it!
    $rootScope.$on('$destroy', function () {
        $rootScope.selectOwnerModal.remove();
    });
    // Execute action on hide modal
    $rootScope.$on('modal.hidden', function () {
        // Execute action
    });
    // Execute action on remove modal
    $rootScope.$on('modal.removed', function () {
        // Execute action
    });

    $rootScope.onOwnerTypeSelectChange = function () {
        if ($rootScope.selected.selectedOwnerType == 'org') {
            $rootScope.selected.selectedPersonOwner = null;
        } else {
            $rootScope.selected.selectedOrgOwner = null;
        }
    }

    $rootScope.isAddOwnerButtonDisabled = function () {
        if ($rootScope.selected.selectedOrgOwner != null && $rootScope.selected.selectedOwnerType == 'org') {            
            return false;
        } else if ($rootScope.selected.selectedPersonOwner != null && $rootScope.selected.selectedOwnerType == 'person') {            
            return false;
        }
        return true;
    }

    $rootScope.addOwner = function () {
        $rootScope.ownersSet = true;
        if ($rootScope.selected.selectedOwnerType == 'person') {
            $rootScope.selectedContacts.push($rootScope.selected.selectedPersonOwner);
            $rootScope.data.shipowners.people.push($rootScope.selected.selectedPersonOwner.id);

            $rootScope.contacts.splice($rootScope.contacts.indexOf($rootScope.selected.selectedPersonOwner), 1);
        } else if ($rootScope.selected.selectedOwnerType == 'org') {
            $rootScope.selectedOrgs.push($rootScope.selected.selectedOrgOwner);
            $rootScope.data.shipowners.organizations.push($rootScope.selected.selectedOrgOwner.id);

            $rootScope.organizations.splice($rootScope.organizations.indexOf($rootScope.selected.selectedOrgOwner), 1);
        }
        $rootScope.closeOwnerModal();
    }

    $rootScope.removeContactOwner = function (contact) {
        $rootScope.selectedContacts.splice($rootScope.contacts.indexOf(contact), 1);
        $rootScope.data.shipowners.people.splice($rootScope.data.shipowners.people.indexOf(contact.id), 1);

        $rootScope.contacts.push(contact);
    }

    $rootScope.removeOrgOwner = function (org) {
        $rootScope.selectedOrgs.splice($rootScope.organizations.indexOf(org), 1);
        $rootScope.data.shipowners.organizations.splice($rootScope.data.shipowners.organizations.indexOf(org.id), 1);

        $rootScope.organizations.push(org);
    }
   
    $rootScope.saveVessel = function () {
        $rootScope.data.accountId = accountId;

        VesselService.newVessel(accountId, $rootScope.data)
            .success(function (reponse) {
                var alertPopup = $ionicPopup.alert({
                    title: $translate.instant('NEW_VESSEL_SUCCESS_TITLE'),
                    template: $translate.instant('NEW_VESSEL_SUCCESS_MSG')
                });
                $state.go('menu.vessels');
            }).error(function (error_code) {
                var alertPopup = $ionicPopup.alert({
                    title: $translate.instant('SERVER_ERROR_TITLE'),
                    template: $translate.instant('SERVER_ERROR_MSG')
                });
            });
    }
    
    $rootScope.getVesselInfo = function (vessel) {
        $rootScope.selectedVessel = vessel;

        $state.go('menu.vessel-info');
    }

})

.controller('VesselInfoCtrl', function ($scope, $ionicPopup, $translate, $state, $ionicModal, VesselService) {
    var accountId = $scope.accountId;
    

     $scope.deleteVessel = function () {
        var vesselId = $scope.selectedVessel.id;

        var confirmPopup = $ionicPopup.confirm({
            title: $translate.instant('DELETE_VESSEL_TITLE'),
            template: $translate.instant('DELETE_VESSEL_CONFIRM_MSG'),
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
                VesselService.deleteVessel(accountId, vesselId)
                    .success(function (response) {
                        var alertPopup = $ionicPopup.alert({
                            title: $translate.instant('DELETE_VESSEL_SUCCESS_TITLE'),
                            template: $translate.instant('DELETE_VESSEL_SUCCESS_MSG')
                        });

                        $state.go('menu.vessels');
                    }).error(function (msg) {
                        var alertPopup = $ionicPopup.alert({
                            title: $translate.instant('DELETE_VESSEL_ERROR_TITLE'),
                            template: $translate.instant('DELETE_VESSEL_ERROR_MSG')
                        });
                    });
            }
        });
    }
});
