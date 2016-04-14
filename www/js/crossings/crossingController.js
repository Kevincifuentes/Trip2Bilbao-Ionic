angular.module('blusecur.crossing.controllers', [])

.controller('CrossingCtrl', function ($rootScope, $timeout, $interval, $ionicPopup, $state, $filter, $translate, store, jwtHelper, $ionicModal, CrossingService, VesselService, CrewService, ContactsService, LovsService, LocationService, uiGmapGoogleMapApi) {
    $rootScope.data = {};
    $rootScope.account = store.get('account');

    $rootScope.vesselCrossing = null;
    $rootScope.vessel = {};

    $rootScope.crewCrossing = null;
    $rootScope.crew = {};

    $rootScope.checklistVal = false;

    $rootScope.checklist = [
        { text: "Revisión del parametro 1", checked: false },
        { text: "Revisión del parametro 2", checked: false },
        { text: "Revisión del parametro 3", checked: false },
        { text: "Revisión del parametro 4", checked: false },
        { text: "Revisión del parametro 5", checked: false }
    ];

    var locale = $translate.preferredLanguage();
    $rootScope.locale = locale;

    var jwt = store.get('jwt');
    var decodedJwt = jwtHelper.decodeToken(jwt);
    var accountId = decodedJwt.accountId;
    $rootScope.accountId = accountId;
     
    CrossingService.getCrossings(accountId)
        .success(function (crossings) {
            $rootScope.crossings = crossings;
        }).error(function (error_code) {
            var alertPopup = $ionicPopup.alert({
                title: $translate.instant('SERVER_ERROR_TITLE'),
                template: $translate.instant('SERVER_ERROR_MSG')
            });
        });

    ContactsService.getPersonContacts(accountId)
       .success(function (contacts) {
           $rootScope.contacts = contacts;
           $rootScope.contacts.push($rootScope.account);
       }).error(function (error_code) {
           var alertPopup = $ionicPopup.alert({
               title: $translate.instant('SERVER_ERROR_TITLE'),
               template: $translate.instant('SERVER_ERROR_MSG')
           });
       });

    //VESSELS

    VesselService.getVessels(accountId)
        .success(function (vessels) {
            $rootScope.vessels = vessels;

            angular.forEach($rootScope.vessels, function (vessel, index) {
                LovsService.getLocStatus(locale, vessel.status)
                     .success(function (status) {
                         vessel.statusName = status.name;
                     });
                LovsService.getLocVesselType(locale, vessel.type)
                     .success(function (type) {
                         vessel.typeName = type.type;
                     });
            });
        }).error(function (error_code) {
            var alertPopup = $ionicPopup.alert({
                title: $translate.instant('SERVER_ERROR_TITLE'),
                template: $translate.instant('SERVER_ERROR_MSG')
            });
        });

    $rootScope.addVessel = function () {
        $rootScope.vesselCrossing = angular.copy($rootScope.vessel);
        $rootScope.closeVesselModal();
    }

    $rootScope.removeVessel = function () {
        $rootScope.vesselCrossing = null;
    }

    $ionicModal.fromTemplateUrl('select-vessel-modal.html', {
        scope: $rootScope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $rootScope.vesselModal = modal;
    });
    $rootScope.openVesselModal = function (isPatron) {
        $rootScope.vessel = {};
        $rootScope.vesselModal.show();
    };
    $rootScope.closeVesselModal = function () {
        $rootScope.vesselModal.hide();
    };
    //Cleanup the modal when we're done with it!
    $rootScope.$on('$destroy', function () {
        $rootScope.vesselModal.remove();
    });

    //CHECKLIST

    $rootScope.addChecklist = function () {
        $rootScope.closeChecklistModal();
    }

    $rootScope.removeChecklist = function () {
        $rootScope.checklist = false;
    }

    $ionicModal.fromTemplateUrl('select-checklist-modal.html', {
        scope: $rootScope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $rootScope.checklistModal = modal;
    });
    $rootScope.openChecklistModal = function (isPatron) {
        $rootScope.checklistModal.show();
    };
    $rootScope.closeChecklistModal = function () {
        $rootScope.checklistModal.hide();
    };
    //Cleanup the modal when we're done with it!
    $rootScope.$on('$destroy', function () {
        $rootScope.checklistModal.remove();
    });

    //CREWS

    CrewService.getCrews(accountId)
        .success(function (crews) {
            $rootScope.crews = crews;

            angular.forEach($rootScope.crews, function (crew, index) {
                crew.patronMember = null;
                crew.noPatronMembers = [];

                angular.forEach(crew.members, function (crewMemberV, indexj) {
                    var memberV = $rootScope.getContact(crewMemberV.member);

                    LovsService.getCapabilityName(locale, memberV.capability)
                        .success(function (capability) {
                            memberV.capabilityName = capability.type;
                        });

                    if (memberV != null) {
                        if (crewMemberV.role == '001') crew.patronMember = memberV; //es patrón
                        else crew.noPatronMembers.push(memberV);
                    }
                });

                if (crew.ownerCrewMember != null) {
                    if (crew.ownerCrewMember.role == '001') crew.patronMember = $rootScope.account;
                    else crew.noPatronMembers.push($rootScope.account);
                }
            });
        }).error(function (error_code) {
            var alertPopup = $ionicPopup.alert({
                title: $translate.instant('SERVER_ERROR_TITLE'),
                template: $translate.instant('SERVER_ERROR_MSG')
            });
        });

    $rootScope.getContact = function (contactId) {  
        var contactFound = {};
        angular.forEach($rootScope.contacts, function (contact, index) {
            if (contact.id == contactId) {
                contactFound = angular.copy(contact);
            }
        });
        return contactFound;
    }

    $rootScope.addCrew = function () {
        $rootScope.crewCrossing = angular.copy($rootScope.crew);
        $rootScope.closeCrewModal();
    }

    $rootScope.removeCrew = function () {
        $rootScope.crewCrossing = null;
    }

    $ionicModal.fromTemplateUrl('select-crew-modal.html', {
        scope: $rootScope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $rootScope.crewModal = modal;
    });
    $rootScope.openCrewModal = function (isPatron) {
        $rootScope.crew = {};
        $rootScope.crewModal.show();
    };
    $rootScope.closeCrewModal = function () {
        $rootScope.crewModal.hide();
    };

    //Cleanup the modal when we're done with it!
    $rootScope.$on('$destroy', function () {
        $rootScope.vesselModal.remove();
        $rootScope.crewModal.remove();
        $rootScope.checklistModal.remove();
    });

    // Execute action on hide modal
    $rootScope.$on('modal.hidden', function () {
        // Execute action
    });
    // Execute action on remove modal
    $rootScope.$on('modal.removed', function () {
        // Execute action
    });

    //CROSSINGS

    $rootScope.saveCrossing = function () {

        $rootScope.crossing = {};
        $rootScope.crossing.accountId = accountId;
        $rootScope.crossing.name = $rootScope.data.name;
        $rootScope.crossing.vesselId = $rootScope.vesselCrossing.data.id;
        $rootScope.crossing.crewId = $rootScope.crewCrossing.data.id;
        
        $rootScope.newCrossing();
        //$rootScope.saveTrack();
        //$rootScope.updateCrossing();
    }
    
    $rootScope.newCrossing = function () {
        CrossingService.newCrossing(accountId)
            .success(function (response) {
                $rootScope.crossing.id = response.id;
                $rootScope.saveTrack();
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

    $rootScope.saveTrack = function () {

        $rootScope.track = {};
        $rootScope.track.accountId = accountId;
        var filterdatetime = $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss.sss');
        $rootScope.track.startTimestamp = filterdatetime;

        $rootScope.newTrack();
    }

    $rootScope.newTrack = function () {
        CrossingService.newTrack(accountId, $rootScope.track)
            .success(function (response) {
                $rootScope.track = response;
                $rootScope.crossing.trackId = response.id;
                $rootScope.updateCrossing();
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

    $rootScope.updateCrossing = function () {
        CrossingService.updateCrossing(accountId, $rootScope.crossing)
            .success(function (response) {
                /*var alertPopup = $ionicPopup.alert({
                    title: $translate.instant('CROSSING_CREATION_SUCCESS_TITLE'),
                    template: $translate.instant('CROSSING_CREATION_SUCCESS_MSG')
                });*/
                $state.go('menu.track-map', { track: $rootScope.track });

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

    $rootScope.getCrossingInfo = function (crossing) {
        $rootScope.selectedCrossing = crossing;

        CrossingService.getTrack(accountId, crossing.trackId)
            .success(function (track) {
                $rootScope.selectedTrack = track;
            });

        VesselService.getVessel(accountId, crossing.vesselId)
            .success(function (vessel) {
                $rootScope.selectedCrossing.vessel = vessel;
            });

        CrewService.getCrew(accountId, crossing.crewId)
            .success(function (crew) {
                $rootScope.selectedCrossing.crew = crew;                
                var memberCount = crew.members.length + 1;
                $rootScope.selectedCrossing.crew.memberCount = memberCount;

                angular.forEach(crew.members, function (crewMemberV, index) {
                    var memberV = $rootScope.getContact(crewMemberV.member);
            
                    if (memberV != null) {
                        if (crewMemberV.role == '001') {
                            //Es patrón
                            $rootScope.selectedCrossing.crew.patronName = memberV.name + " " + memberV.lastname;
                        } 
                    }
                });
            });

        $state.go('menu.crossing-info');
    }

    $rootScope.checklistChange = function (item) {
        console.log(item);
        $rootScope.checklistVal = true;
        angular.forEach($rootScope.checklist, function (checkitem, index) {
            $rootScope.checklistVal = $rootScope.checklistVal && checkitem.checked;
        });
    };
    
})

.controller('CrossingInfoCtrl', function ($scope, $timeout, $interval, $ionicPopup, $translate, $state, $filter, CrossingService, $ionicModal, LocationService, uiGmapGoogleMapApi) {
   
    var accountId = $scope.accountId;
    $scope.getTrackInfo = function () { $state.go('menu.track-map', { track: $scope.selectedTrack }); }
    
});