// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
angular.module('starter', ['ionic', 'pascalprecht.translate', "angular-jwt",
    'blusecur.menu.controllers',
    'blusecur.authentication.controllers',
    'blusecur.home.controllers',
    'blusecur.contact.controllers',
    'blusecur.vessel.controllers',
    'blusecur.crew.controllers',
    'blusecur.crossing.controllers',
    'blusecur.track.controllers',
    'blusecur.mapa.controllers',
    'blusecur.authentication.services',
    'blusecur.contact.services',
    'blusecur.vessel.services',
    'blusecur.lovs.services',
    'blusecur.crew.services',
    'blusecur.crossing.services',
    'blusecur.location.services',
    'blusecur.directives',
    'blusecur.factories',
    'uiGmapgoogle-maps',
    'ngCordova', 
    'ion-place-tools'
    ])

.constant('config', {
    //API_URL: 'http://10.45.1.84:8080'
    //API_URL: 'http://api.blusecur.net'
})

.run(function ($ionicPlatform, $rootScope, $state, store, jwtHelper) {
    $rootScope.primera = true;
    /*$rootScope.$on('$stateChangeStart', function (e, to, toParams, fromState, fromParams) {

        if (to.data && to.data.requiresLogin) {
            if (!store.get('jwt') || jwtHelper.isTokenExpired(store.get('jwt'))) {

                e.preventDefault();
               
            }
        }
    });*/

    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        //if (window.cordova && window.cordova.plugins.Keyboard) {
        //    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        //    cordova.plugins.Keyboard.disableScroll(true);

        //}
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
    $state.go('menu.home');

})

.config(function ($stateProvider, $urlRouterProvider, $translateProvider, jwtInterceptorProvider, $httpProvider, $ionicConfigProvider, uiGmapGoogleMapApiProvider) {

    $ionicConfigProvider.backButton.previousTitleText(false).text('');

    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyCgJH62TeOB_tnB2EOhMkkDJoP5cVR79RQ',
        v: '3.20',
        libraries: 'weather,geometry,visualization,places'
    });
    
    $stateProvider
    .state('menu', {
        url: '/menu',
        abstract: true,
        templateUrl: 'templates/menu/menu.html',
        controller: 'MenuCtrl'
    })

    .state('menu.home', {
        url: '/home',
        cache: true,
        views: {
            'menuContent': {
                templateUrl: 'templates/home/home.html',
                data: {
                    requiresLogin: true
                }
            }
        }
    })

    .state('menu.vessels', {
        url: '/vessels',
        cache: false,
        views: {
        'menuContent': {
            templateUrl: 'templates/vessels/vessels.html',
            controller: 'VesselCtrl',
            data: {
                requiresLogin: true
            }
        }
        }
    })

    .state('menu.new-vessel', {
        url: '/vessels/new',
        views: {
            'menuContent': {
                templateUrl: 'templates/vessels/newVessel.html',
                controller: 'VesselCtrl',
                data: {
                    requiresLogin: true
                }
            }
        }
    })

    .state('menu.vessel-info', {
        url: '/vessels/vessel-info',
        cache: false,
        views: {
            'menuContent': {
                templateUrl: 'templates/vessels/viewVessel.html',
                controller: 'VesselInfoCtrl',
                data: {
                    requiresLogin: true
                }
            }
        }
    })


    .state('menu.contacts', {
      url: '/contacts',
      cache: false,
      views: {
        'menuContent': {
            templateUrl: 'templates/contacts/contacts.html',
            controller: 'ContactCtrl',
            data: {
                requiresLogin: true
            }
        }
      }
    })

    .state('menu.contacts.persons', {
        url: '/persons',
        cache: false,
        views: {
            'tab-persons': {
                templateUrl: 'templates/contacts/persons.html',
                controller: 'ContactCtrl',
                data: {
                    requiresLogin: true
                }
            }
        }
    })

    .state('menu.new-person', {
        url: '/contacts/new-person',
        views: {
            'menuContent': {
                templateUrl: 'templates/contacts/newPersonContact.html',
                controller: 'ContactCtrl',
                data: {
                    requiresLogin: true
                }
            }
        }
    })

    .state('menu.person-contact-info', {
        url: '/contacts/person-info',
        cache: false,
        views: {
            'menuContent': {
                templateUrl: 'templates/contacts/viewPersonContact.html',
                controller: 'ContactInfoCtrl',
                data: {
                    requiresLogin: true
                }
            }
        }
    })
       
    .state('menu.contacts.organizations', {
        url: '/organizations',
        cache: false,
        views: {
            'tab-organizations': {
                templateUrl: 'templates/contacts/organizations.html',
                controller: 'ContactCtrl',
                data: {
                    requiresLogin: true
                }
            }
        }
    })
    .state('menu.new-organization', {
        url: '/contacts/new-organization',
        views: {
            'menuContent': {
                templateUrl: 'templates/contacts/newOrganization.html',
                controller: 'ContactCtrl',
                data: {
                    requiresLogin: true
                }
            }
        }
    })

    .state('menu.organization-contact-info', {
        url: '/contacts/organization-info',
        cache: false,
        views: {
            'menuContent': {
                templateUrl: 'templates/contacts/viewOrganizationContact.html',
                controller: 'ContactInfoCtrl',
                data: {
                    requiresLogin: true
                }
            }
        }
    })
        
    .state('menu.crossings', {
        url: '/crossings',
        cache: false,
        views: {
            'menuContent': {
                templateUrl: 'templates/crossings/crossings.html',
                controller: 'CrossingCtrl',
                data: {
                    requiresLogin: true
                }
            }
        }
    })

    .state('menu.crossing-info', {
        url: '/crossings/crossing-info',
        cache: false,
        views: {
            'menuContent': {
                templateUrl: 'templates/crossings/viewCrossing.html',
                controller: 'CrossingInfoCtrl',
                data: {
                    requiresLogin: true
                }
            }
        }
    })

    .state('menu.track-map', {
        url: '/tracks/track-map',
        cache: true,
        views: {
            'menuContent': {
                templateUrl: 'templates/tracks/mapTrack.html',
                controller: 'TrackMapCtrl',
                data: {
                    requiresLogin: false
                }
            }
        }
    })
    
    .state('menu.track-map2', {
            url: '/tracks/track-map/:ejecutar',
            cache: true,
            views: {
                'menuContent': {
                    templateUrl: 'templates/tracks/mapTrackTodo.html',
                    controller: 'TrackMapTodoCtrl',
                    data: {
                        requiresLogin: false
                    }
                }
            }
        })

    .state('menu.new-crossing', {
        url: '/crossings/new-crossing',
        views: {
            'menuContent': {
                templateUrl: 'templates/crossings/newCrossing.html',
                controller: 'CrossingCtrl',
                data: {
                    requiresLogin: true
                }
            }
        }
    })

    .state('menu.crews', {
        url: '/crews',
        cache: false,
        views: {
            'menuContent': {
                templateUrl: 'templates/crews/crews.html',
                controller: 'CrewCtrl',
                data: {
                    requiresLogin: true
                }
            }
        }
    })
    .state('menu.crew-info', {
        url: '/crews/crew-info',
        cache: false,
        views: {
            'menuContent': {
                templateUrl: 'templates/crews/viewCrew.html',
                controller: 'CrewInfoCtrl',
                data: {
                    requiresLogin: true
                }
            }
        }
    })

    .state('menu.new-crew', {
        url: '/crews/new-crew',
        views: {
            'menuContent': {
                templateUrl: 'templates/crews/newCrew.html',
                controller: 'CrewCtrl',
                data: {
                    requiresLogin: true
                }
            }
        }
    })

    .state('menu.alerts', {
        url: '/alerts',
        views: {
            'menuContent': {
                templateUrl: 'templates/alerts/alerts.html',
                data: {
                    requiresLogin: true
                }
            }
        }
    })

    .state('menu.checklists', {
        url: '/checklists',
        views: {
            'menuContent': {
                templateUrl: 'templates/checklists/checklists.html',
                data: {
                    requiresLogin: true
                }
            }
        }
    })

    .state('menu.settings', {
        url: '/settings',
        views: {
            'menuContent': {
                templateUrl: 'templates/settings/settings.html',
                data: {
                    requiresLogin: true
                }
            }
        }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/home');
});
