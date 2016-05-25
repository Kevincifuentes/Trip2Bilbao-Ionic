// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
angular.module('starter', ['ionic', 'pascalprecht.translate', "angular-jwt",
    'trip2bilbao.menu.controllers',
    'trip2bilbao.home.controllers',
    'trip2bilbao.track.controllers',
    'trip2bilbao.mapa.controllers',
    'trip2bilbao.favoritos.controllers',
    'trip2bilbao.navigation.controllers',
    'trip2bilbao.meteo.controllers',
    'trip2bilbao.directives',
    'trip2bilbao.factories',
    'uiGmapgoogle-maps',
    'ngCordova', 
    'ion-place-tools'
    ])

.constant('config', {
})

.config(['$ionicConfigProvider', function($ionicConfigProvider) {

    $ionicConfigProvider.tabs.position('bottom'); // other values: top

}])
.service('activeMQ', ["$rootScope", function ($rootScope) {
    this.inicializarActiveMQ = function () {
        $rootScope.w = new Worker("js/WebWorker/activeMQ.js");
        $rootScope.w.onmessage = function (event) {
            var lines = event.data;
            var tipo = event.data[4].substring(lines[4].indexOf(":") + 1, lines[4].length);

            switch (tipo) {
                case "TiempoCiudad":
                    if (window.DOMParser) {
                        $rootScope.meteo = [];

                        parser = new DOMParser();
                        xmlDoc = parser.parseFromString(lines[8], "text/xml");
                        var nombreCiudad = xmlDoc.getElementsByTagName("Nombre")[0].childNodes[0].nodeValue;
                        var descripcionGeneralHES = xmlDoc.getElementsByTagName("ES")[0].childNodes[0].nodeValue;
                        var descripcionGeneralHEU = xmlDoc.getElementsByTagName("EU")[0].childNodes[0].nodeValue;
                        var descripcionHES = xmlDoc.getElementsByTagName("DescripcionES")[0].childNodes[0].nodeValue;
                        var descripcionHEU = xmlDoc.getElementsByTagName("DescripcionEU")[0].childNodes[0].nodeValue;
                        var tempMaxH = xmlDoc.getElementsByTagName("TempMax")[0].childNodes[0].nodeValue;
                        var tempMinH = xmlDoc.getElementsByTagName("TempMin")[0].childNodes[0].nodeValue;

                        var descripcionGeneralMES = xmlDoc.getElementsByTagName("ES")[1].childNodes[0].nodeValue;
                        var descripcionGeneralMEU = xmlDoc.getElementsByTagName("EU")[1].childNodes[0].nodeValue;
                        var descripcionMES = xmlDoc.getElementsByTagName("DescripcionES")[1].childNodes[0].nodeValue;
                        var descripcionMEU = xmlDoc.getElementsByTagName("DescripcionEU")[1].childNodes[0].nodeValue;
                        var tempMaxM = xmlDoc.getElementsByTagName("TempMax")[1].childNodes[0].nodeValue;
                        var tempMinM = xmlDoc.getElementsByTagName("TempMin")[1].childNodes[0].nodeValue;

                        var descripcionGeneralPES = xmlDoc.getElementsByTagName("ES")[2].childNodes[0].nodeValue;
                        var descripcionGeneralPEU = xmlDoc.getElementsByTagName("EU")[2].childNodes[0].nodeValue;
                        var descripcionPES = xmlDoc.getElementsByTagName("DescripcionES")[2].childNodes[0].nodeValue;
                        var descripcionPEU = xmlDoc.getElementsByTagName("DescripcionEU")[2].childNodes[0].nodeValue;
                        var tempMaxP = xmlDoc.getElementsByTagName("TempMax")[2].childNodes[0].nodeValue;
                        var tempMinP = xmlDoc.getElementsByTagName("TempMin")[2].childNodes[0].nodeValue;

                        var hoy = { gES: descripcionGeneralHES, gEU: descripcionGeneralHEU, dES: descripcionHES, dEU: descripcionHEU, tMax: tempMaxH, tMin: tempMinH };
                        var manana = { gES: descripcionGeneralMES, gEU: descripcionGeneralMEU, dES: descripcionMES, dEU: descripcionMEU, tMax: tempMaxM, tMin: tempMinM };
                        var pasado = { gES: descripcionGeneralPES, gEU: descripcionGeneralPEU, dES: descripcionPES, dEU: descripcionPEU, tMax: tempMaxP, tMin: tempMinP };
                        console.log(hoy);
                        console.log(manana);
                        console.log(pasado);
                        $rootScope.meteo.push(hoy);
                        $rootScope.meteo.push(manana);
                        $rootScope.meteo.push(pasado);

                    }
                    break;
                case "TiemposLinea":
                    if (window.DOMParser) {
                        if ($rootScope.estadosBilbobus === undefined) {
                            $rootScope.estadosBilbobus = {};
                        }
                        console.log("paradas!");
                        parser = new DOMParser();
                        xmlDoc = parser.parseFromString(lines[9], "text/xml");
                        //console.log(lines[9]);
                        var id = xmlDoc.getElementsByTagName("TiemposLinea")[0].getAttribute("Id");
                        var nombre = xmlDoc.getElementsByTagName("TiemposLinea")[0].getAttribute("Nombre");

                        var paradas = xmlDoc.getElementsByTagName("Paradas")[0].childNodes;
                        for (var i = 0; i < paradas.length; i++) {
                            var idP = paradas[i].getElementsByTagName("Id")[0].childNodes[0].nodeValue;
                            var tiempo = paradas[i].getElementsByTagName("TiempoRestante")[0].childNodes[0].nodeValue;
                            var tiempoLineaEnParada = { id: id, linea: nombre, tiempo: tiempo };
                            if (idP in $rootScope.estadosBilbobus) {
                                if(id in $rootScope.estadosBilbobus[idP])
                                {
                                    $rootScope.estadosBilbobus[idP][id].tiempo = tiempo;
                                }
                                else
                                {
                                    $rootScope.estadosBilbobus[idP][id] = tiempoLineaEnParada;
                                }
                                
                                
                                //console.log($rootScope.estadosBilbobus[idP][id]);
                                /*var array = $rootScope.estadosBilbobus[idP];
                                for (var z = 0; z < array.length; i++) {
                                    if (array[z].id === id) {
                                        //$rootScope.estadosBilbobus[idP].splice(z, 1);
                                        $rootScope.estadosBilbobus[idP].push(tiempoLineaEnParada);
                                        break;
                                    }
                                }*/
                            }
                            else {
                                
                                $rootScope.estadosBilbobus[idP] = {};
                                $rootScope.estadosBilbobus[idP][id] = tiempoLineaEnParada;
                                
                            }
                        }
                    }
                    break;
                case "Parkings":
                    if (window.DOMParser) {
                        parser = new DOMParser();
                        //console.log(lines[10]);
                        xmlDoc = parser.parseFromString(lines[9], "text/xml");
                        var nombre = xmlDoc.getElementsByTagName("Nombre")[0].childNodes[0].nodeValue;
                        var disponibilidad = xmlDoc.getElementsByTagName("Disponibilidad")[0].childNodes[0].nodeValue;
                        if ($rootScope.estadosParking === undefined)
                        {
                            $rootScope.estadosParking = {};
                        }
                        $rootScope.estadosParking[nombre] = disponibilidad;
                        //estadoParkings[nombre] = disponibilidad;
                        console.log("parking "+ nombre + " " +disponibilidad);
                    }
                    break;

                case "Deusto":
                    if (window.DOMParser) {
                        parser = new DOMParser();
                        xmlDoc = parser.parseFromString(lines[9], "text/xml");
                        var general = xmlDoc.getElementsByTagName("General")[0].childNodes[0].nodeValue;
                        var dbs = xmlDoc.getElementsByTagName("Dbs")[0].childNodes[0].nodeValue;
                        console.log("Deusto "+ dbs+" / "+ general);
                        if ($rootScope.estadosParking === undefined) {
                            $rootScope.estadosParking = {};
                        }
                        $rootScope.estadosParking["UD: DBS"] = dbs;
                        $rootScope.estadosParking["UD: General"] = general;
                        
                    }
                    break;

                case "Bicis":
                    if (window.DOMParser) {
                        //Lo convertimos mediante un parseador
                        var parser = new DOMParser();
                        //Obtenemos solo el XML
                        var xmlDoc = parser.parseFromString(lines[9], "text/xml");
                        //Se obtienen los datos que interesan
                        var nombre = xmlDoc.getElementsByTagName("Nombre")[0].childNodes[0].nodeValue;
                        var disponibilidadbicis = xmlDoc.getElementsByTagName("BicisLibres")[0].childNodes[0].nodeValue;
                        var disponibilidadAnclajes = xmlDoc.getElementsByTagName("DisponibilidadAnclaje")[0].childNodes[0].nodeValue;
                        console.log("Bicis " + disponibilidadbicis + " / " + disponibilidadAnclajes);
                        if ($rootScope.estadosBici === undefined) {
                            $rootScope.estadosBici = {};
                        }
                        $rootScope.estadosBici[nombre] = "<b>Bicis Libres: </b>" + disponibilidadbicis + " / <b> Anclajes Libres: </b>" + disponibilidadAnclajes;
                    }
                    break;
                default:
            }
        };
        
    };

}])

.run(function ($ionicPlatform, $rootScope, $state, $ionicLoading, jwtHelper) {
    $ionicLoading.show({
            content: 'Cargando...',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
    $rootScope.meteo = [];
    if ($rootScope.estadosBilbobus === undefined)
    {
        $rootScope.estadosBilbobus = {};
    }
    if ($rootScope.estadosBici === undefined)
    {
        $rootScope.estadosBici = {};
    }
    if ($rootScope.estadosParking === undefined)
    {
        $rootScope.estadosParking = {};
    }
    $rootScope.primera = true;
    /*$rootScope.$on('$stateChangeStart', function (e, to, toParams, fromState, fromParams) {

        if (to.data && to.data.requiresLogin) {
            if (!store.get('jwt') || jwtHelper.isTokenExpired(store.get('jwt'))) {

                e.preventDefault();
               
            }
        }
    });*/
    //Inicializo el WebSocket al puerto e Ip del ActiveMQ. Se utilizará un servicio STOMP.
    

    

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

   /* uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyCgJH62TeOB_tnB2EOhMkkDJoP5cVR79RQ',
        v: '3.20',
        libraries: 'weather,geometry,visualization,places'
    });*/
    
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
                controller: 'HomeCtrl',
                data: {
                    requiresLogin: false
                }
            }
        }
    })
    
      


    .state('menu.track-map', {
        url: '/tracks/track-map',
        cache: false,
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

        .state('menu.track-mapFav', {
            url: '/tracks/track-map/fav',
            cache: false,
            views: {
                'menuContent': {
                    templateUrl: 'templates/tracks/mapTrackFav.html',
                    controller: 'TrackMapFav',
                    data: {
                        requiresLogin: false
                    }
                }
            }
        })

    .state('menu.navigation', {
            url: '/navigation',
            views: {
                'menuContent': {
                    templateUrl: 'templates/navigation/navigation.html',
                    controller: 'NavigationCtrl',
                    data: {
                        requiresLogin: false
                    }
                }
            }
    })
    .state('menu.tabs', {
        url: "/tab",
        abstract : true,
        views: {
            'menuContent': {
                templateUrl: "templates/meteo/tabs.html",
                controller: 'MeteoCtrl',
                data: {
                    requiresLogin: false
                }
            }
        }
        
    })
    .state('menu.tabs.home', {
        url: "/home",
        views: {
            'home-tab': {
                templateUrl: "templates/meteo/home.html",
                controller: 'MeteoCtrl'
            }
        }
    })
    .state('menu.tabs.facts', {
        url: "/facts",
        views: {
            'home-tab': {
                templateUrl: "templates/meteo/facts.html"
            }
        }
    })
    .state('menu.tabs.facts2', {
        url: "/facts2",
        views: {
            'home-tab': {
                templateUrl: "templates/meteo/facts2.html"
            }
        }
    })
    .state('menu.tabs.about', {
        url: "/about",
        views: {
            'about-tab': {
                templateUrl: "templates/meteo/about.html"
            }
        }
    })
    .state('menu.tabs.navstack', {
        url: "/navstack",
        views: {
            'about-tab': {
                templateUrl: "templates/meteo/nav-stack.html"
            }
        }
    })
    .state('menu.tabs.contact', {
        url: "/contact",
        views: {
            'contact-tab': {
                templateUrl: "templates/meteo/contact.html"
            }
        }
    });


    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/home');
});
