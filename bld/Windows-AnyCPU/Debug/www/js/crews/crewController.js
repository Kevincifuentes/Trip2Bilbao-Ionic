angular.module('blusecur.crew.controllers', [])

.controller('CrewCtrl', function ($rootScope, $ionicPopup, $state, $translate, store, jwtHelper, $ionicModal, CrewService, ContactsService, LovsService) {
    $rootScope.data = {};
        
    $rootScope.patronContact = null;

    $rootScope.memberContactList = [];
    $rootScope.member = {};
    $rootScope.memberContact = null;

    $rootScope.account = store.get('account');

    var locale = $translate.preferredLanguage();
    $rootScope.locale = locale;

    var jwt = store.get('jwt');
    var decodedJwt = jwtHelper.decodeToken(jwt);
    var accountId = decodedJwt.accountId;
    $rootScope.accountId = accountId;

    ContactsService.getPersonContacts(accountId)
       .success(function (contacts) {
           $rootScope.contacts = contacts;

           angular.forEach($rootScope.contacts, function (contact, index) {
               LovsService.getCapabilityName(locale, contact.capability)
                   .success(function (capability) {
                       contact.capabilityName = capability.type;
                   });
           });

           $rootScope.contacts.push($rootScope.account);
       }).error(function (error_code) {
           var alertPopup = $ionicPopup.alert({
               title: $translate.instant('SERVER_ERROR_TITLE'),
               template: $translate.instant('SERVER_ERROR_MSG')
           });
       });

    //LovsService.getRoles()
    //    .success(function (roles) {
    //        $rootScope.roles = roles;
    //    }).error(function (error_code) {
    //        var alertPopup = $ionicPopup.alert({
    //            title: $translate.instant('SERVER_ERROR_TITLE'),
    //            template: $translate.instant('SERVER_ERROR_MSG')
    //        });
    //    });
     
    CrewService.getCrews(accountId)
        .success(function (crews) {
            $rootScope.crews = crews;
        }).error(function (error_code) {
            var alertPopup = $ionicPopup.alert({
                title: $translate.instant('SERVER_ERROR_TITLE'),
                template: $translate.instant('SERVER_ERROR_MSG')
            });
        });

    $rootScope.addMember = function () {
        if ($rootScope.isPatron) {
            if ($rootScope.patronContact != null) {
                //Volver a añadir el contacto a la lista, para que pueda volver a ser seleccionado
                $rootScope.contacts.push($rootScope.patronContact.data);
            }
            $rootScope.patronContact = angular.copy($rootScope.member);
            //Quitar el contact de la lista de contactos para que no pueda volver a ser elegido como tripulante
            $rootScope.contacts.splice($rootScope.contacts.indexOf($rootScope.member.data), 1);
        } else {
            $rootScope.memberContact = angular.copy($rootScope.member);
            //Quitar el contact de la lista de contactos para que no pueda volver a ser elegido como tripulante
            $rootScope.contacts.splice($rootScope.contacts.indexOf($rootScope.member.data), 1);
            $rootScope.memberContactList.push($rootScope.member.data);
        }

        $rootScope.closeMemberModal();
    }

    $rootScope.removeMember = function (member) {
        $rootScope.contacts.push(member);
        $rootScope.memberContactList.splice($rootScope.memberContactList.indexOf(member), 1);
    }

    $rootScope.removePatron = function () {
        $rootScope.contacts.push($rootScope.patronContact.data);
        $rootScope.patronContact = null;
    }

    $ionicModal.fromTemplateUrl('select-member-modal.html', {
        scope: $rootScope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $rootScope.memberModal = modal;
    });
    $rootScope.openMemberModal = function (isPatron) {
        $rootScope.isPatron = isPatron;
        $rootScope.member = {};
        $rootScope.memberModal.show();
    };
    $rootScope.closeMemberModal = function () {
        $rootScope.memberModal.hide();
    };
    //Cleanup the modal when we're done with it!
    $rootScope.$on('$destroy', function () {
        $rootScope.memberModal.remove();
    });
    // Execute action on hide modal
    $rootScope.$on('modal.hidden', function () {
        // Execute action
    });
    // Execute action on remove modal
    $rootScope.$on('modal.removed', function () {
        // Execute action
    });

    $rootScope.saveCrew = function () {
        var crew = {};
        crew.accountId = accountId;
        crew.name = $rootScope.data.name;

        var accountMember = null;

        var members = [];

        var mPatron = {};
        mPatron.member = $rootScope.patronContact.data.id;
        mPatron.role = '001';
        if ($rootScope.patronContact.data.id == accountId) {
            accountMember = mPatron;
        } else {
            members.push(mPatron);
        }

        angular.forEach($rootScope.memberContactList, function (memberV, index) {
            var m = {};
            m.member = memberV.id;
            m.role = '000';
            if (memberV.id == accountId) {
                accountMember = m;
            } else {
                members.push(m);
            }
        });
        
        crew.members = members;

        crew.ownerCrewMember = accountMember;

        CrewService.newCrew(accountId, crew)
            .success(function () {
                var alertPopup = $ionicPopup.alert({
                    title: $translate.instant('CREW_CREATION_SUCCESS_TITLE'),
                    template: $translate.instant('CREW_CREATION_SUCCESS_MSG')
                });
                $state.go('menu.crews');
            }).error(function (error_code) {
                if (error_code == '000') {
                    var alertPopup = $ionicPopup.alert({
                        title: $translate.instant('ERROR_TITLE'),
                        template: $translate.instant('ERROR_EXISTING_CREW_MSG')
                    });
                } else {
                    var alertPopup = $ionicPopup.alert({
                        title: $translate.instant('SERVER_ERROR_TITLE'),
                        template: $translate.instant('SERVER_ERROR_MSG')
                    });
                }
            });
    }

    $rootScope.getContact = function (contactId) {  
        var contactFound = null;
        angular.forEach($rootScope.contacts, function (contact, index) {
            if (contact.id == contactId) {
               contactFound = angular.copy(contact);
            }
        });
        return contactFound;
    }

    $rootScope.getIfAccountMember = function (crew) {
        if (crew.ownerCrewMember == null) {
            return 0;
        } else {
            return 1;
        }
    }

    $rootScope.getCrewInfo = function (crew) {
        $rootScope.selectedCrew = crew;
        $rootScope.noPatronMembers = [];

        angular.forEach(crew.members, function (crewMemberV, index) {
            var memberV = $rootScope.getContact(crewMemberV.member);
            
            if (memberV != null) {
                if (crewMemberV.role == '001') {
                    //Es patrón
                    $rootScope.patronMember = memberV;
                } else {
                    $rootScope.noPatronMembers.push(memberV);
                }
            }
        });

        if (crew.ownerCrewMember != null) {
            if (crew.ownerCrewMember.role == '001') {
                //Es patrón
                $rootScope.patronMember = $rootScope.account;
            } else {
                $rootScope.noPatronMembers.push($rootScope.account);
            }
        }

        $state.go('menu.crew-info');
    }
    
})

.controller('CrewInfoCtrl', function ($scope, $ionicPopup, $translate, $state, CrewService, $ionicModal, ContactsService, LovsService) {

    var accountId = $scope.accountId;

    $scope.crewToUpdate = angular.copy($scope.selectedCrew);

    $scope.uPatronContact = {};
    $scope.uPatronContact.data = angular.copy($scope.patronMember);

    $scope.uMemberContactList = angular.copy($scope.noPatronMembers);
    $scope.uMember = {};
    $scope.uMemberContact = null;

    ContactsService.getPersonContacts(accountId)
       .success(function (contacts) {
           $scope.unselectedContactList = contacts;

           angular.forEach($scope.unselectedContactList, function (contact, index) {
               LovsService.getCapabilityName($scope.locale, contact.capability)
                   .success(function (capability) {
                       contact.capabilityName = capability.type;
                   });
           });

           angular.forEach($scope.crewToUpdate.members, function (crewMember, index) {
                var contactFound = null;
                angular.forEach($scope.unselectedContactList, function (contact, index) {
                    if (contact.id == crewMember.member) {
                       contactFound = contact;
                    }
                });
                if (contactFound != null) {
                    $scope.unselectedContactList.splice($scope.unselectedContactList.indexOf(contactFound), 1);
                }
           });

           if ($scope.crewToUpdate.ownerCrewMember == null) {
               $scope.unselectedContactList.push($scope.account);
           }

       }).error(function (error_code) {
           var alertPopup = $ionicPopup.alert({
               title: $translate.instant('SERVER_ERROR_TITLE'),
               template: $translate.instant('SERVER_ERROR_MSG')
           });
       });
    
    $scope.addUMember = function () {
        if ($scope.isPatron) {
            if ($scope.uPatronContact != null) {
                //Volver a añadir el contacto a la lista, para que pueda volver a ser seleccionado
                $scope.unselectedContactList.push($scope.uPatronContact.data);
            }
            $scope.uPatronContact = angular.copy($scope.uMember);
            //Quitar el contact de la lista de contactos para que no pueda volver a ser elegido como tripulante
            $scope.unselectedContactList.splice($scope.unselectedContactList.indexOf($scope.uMember.data), 1);
        } else {
            $scope.uMemberContact = angular.copy($scope.uMember);
            //Quitar el contact de la lista de contactos para que no pueda volver a ser elegido como tripulante
            $scope.unselectedContactList.splice($scope.unselectedContactList.indexOf($scope.uMember.data), 1);
            $scope.uMemberContactList.push($scope.uMember.data);
        }

        $scope.closeUMemberModal();
    }

    $scope.removeUMember = function (member) {
        $scope.unselectedContactList.push(member);
        $scope.uMemberContactList.splice($scope.uMemberContactList.indexOf(member), 1);
    }

    $scope.removeUPatron = function () {
        $scope.unselectedContactList.push($scope.uPatronContact.data);
        $scope.uPatronContact = null;
    }   

    $ionicModal.fromTemplateUrl('edit-crew-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.updateCrewModal = modal;
    });
    $scope.openUpdateCrewModal = function () {
        $scope.updateCrewModal.show();
    };
    $scope.closeUpdateCrewModal = function () {
        $scope.updateCrewModal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.updateCrewModal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
        // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        // Execute action
    });
    
    $scope.deleteCrew = function () {
        var crewId = $scope.selectedCrew.id;

        var confirmPopup = $ionicPopup.confirm({
            title: $translate.instant('DELETE_CREW_TITLE'),
            template: $translate.instant('DELETE_CREW_CONFIRM_MSG'),
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
                CrewService.deleteCrew(accountId, crewId)
                    .success(function (response) {
                        var alertPopup = $ionicPopup.alert({
                            title: $translate.instant('DELETE_CREW_SUCCESS_TITLE'),
                            template: $translate.instant('DELETE_CREW_SUCCESS_MSG')
                        });

                        $state.go('menu.crews');
                        //$state.transitionTo('menu.contacts.persons', $state.$current.params, { reload: true });
                    }).error(function (msg) {
                        var alertPopup = $ionicPopup.alert({
                            title: $translate.instant('DELETE_CREW_ERROR_TITLE'),
                            template: $translate.instant('DELETE_CREW_ERROR_MSG')
                        });
                    });
            }
        });
    }

    $ionicModal.fromTemplateUrl('select-u-member-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.uMemberModal = modal;
    });
    $scope.openUMemberModal = function (isPatron) {
        $scope.isPatron = isPatron;
        $scope.uMember = {};
        $scope.uMemberModal.show();
    };
    $scope.closeUMemberModal = function () {
        $scope.uMemberModal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.uMemberModal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
        // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        // Execute action
    });

    $scope.updateCrew = function () {
        var crew = $scope.crewToUpdate;        

        var members = [];

        var accountMember = null;

        var mPatron = {};
        mPatron.member = $scope.uPatronContact.data.id;
        mPatron.role = '001';
        if ($scope.uPatronContact.data.id == accountId) {
            accountMember = mPatron;
        } else {
            members.push(mPatron);
        }

        angular.forEach($scope.uMemberContactList, function (memberV, index) {
            var m = {};
            m.member = memberV.id;
            m.role = '000';
            if (memberV.id == accountId) {
                accountMember = m;
            } else {
                members.push(m);
            }
        });

        crew.ownerCrewMember = accountMember;

        crew.members = members;

        CrewService.updateCrew(accountId, crew)
            .success(function () {
                var alertPopup = $ionicPopup.alert({
                    title: $translate.instant('CREW_UPDATE_SUCCESS_TITLE'),
                    template: $translate.instant('CREW_UPDATE_SUCCESS_MSG')
                });
                $state.go('menu.crews');
            }).error(function (error_code) {
                var alertPopup = $ionicPopup.alert({
                    title: $translate.instant('SERVER_ERROR_TITLE'),
                    template: $translate.instant('SERVER_ERROR_MSG')
                });
            });
    }
    
});