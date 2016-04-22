angular.module('blusecur.favoritos.controllers', [])

.controller('TrackMapFav', function ($rootScope, $timeout, $interval, $ionicPopup, $state, $stateParams, $filter, $translate, store, jwtHelper, $ionicModal, CrossingService, VesselService, CrewService, ContactsService, LovsService, LocationService, uiGmapGoogleMapApi, $http) {
    
    //Crear elecciones

    //Inicializar mapa
    var favIcon = "img/fav.png";
    var inticor = $rootScope.marcadoresFavoritos[$rootScope.seleccionLista].position;
    var mapOptions = {
        zoom: 13,
        center: inticor,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
    };
    var trafficLayer = new google.maps.TrafficLayer();
    var map = new google.maps.Map(document.getElementById('googleMap2'), mapOptions);
    trafficLayer.setMap(map);

    for(var i =0; i < $rootScope.marcadoresFavoritos.length; i++)
    {
            $rootScope.marcadoresFavoritosGlobal[i].setMap(map);
            infowindow = new google.maps.InfoWindow({
                maxWidth: 350
            });
            google.maps.event.addListener($rootScope.marcadoresFavoritosGlobal[i], 'click', function () {
                infowindow.setContent(this.content);
                infowindow.open(map, this);
            });
    }

    
});