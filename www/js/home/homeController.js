angular.module('trip2bilbao.home.controllers', [])

.controller('HomeCtrl', function ($scope, $rootScope, $compile, $state, $ionicModal, $ionicPopup, $ionicLoading, activeMQ) {
    activeMQ.inicializarActiveMQ();
    $rootScope.destinoDesdeFav = null;
    $rootScope.enrutado = false;
    $rootScope.modo = "coche";
    if ($rootScope.transporte === undefined)
    {
        $rootScope.transporte = "coche";
    }
    $rootScope.correctoFav = function (res) {
            var alertPopup = $ionicPopup.alert({
                title: 'Favorito añadido correctamente',
                template: 'El favorito '+res.nombreFav+' ha sido añadido correctamente al sistema. Podrá visualizarlo en la lista del inicio.'
            });
    };
    $rootScope.pruebaS = "esto es una prueba";
    $rootScope.seleccionLista = -1;
    $rootScope.puntoFav ="";
    $rootScope.mostrarFavorito = function (index) {
        console.log("Favorito " + index);
        $rootScope.seleccionLista = index;
        $state.go('menu.track-mapFav');
    };
    $rootScope.eliminarFav = function (lat, lng, desdeMapa, index) {
        console.log("Se quiere eliminar " + lat + " / " + lng + "/" + desdeMapa);
        
        $scope.showConfirm = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Eliminar Favorito',
                template: '¿Estas seguro que quieres eliminar este favorito?',
                subTitle: 'Esto provocará que se elimine del sistema',
                buttons: [{ text: 'Cancelar' },
                    {
                        text: '<b>Eliminar</b>', type: 'button-positive',
                        onTap: function(e) {
                            return 1;
                        }
                    }]
            });

            confirmPopup.then(function (res) {
                if (res) {
                    if(desdeMapa === false)
                    {
                        console.log("Desde home "+ index);
                        //desde home
                        $rootScope.arrayFavoritos.splice(index, 1);
                        $rootScope.marcadoresFavoritos[index].setMap(null);
                        $rootScope.marcadoresFavoritosGlobal[index].setMap(null);
                        $rootScope.marcadoresFavoritos.splice(index, 1);
                        window.localStorage.setItem('favoritos', JSON.stringify($rootScope.arrayFavoritos));
                    }
                    else
                    {
                        console.log("Desde mapa "+ index);
                        if (index !== undefined)
                        {
                            $rootScope.arrayFavoritos.splice(index, 1);
                            $rootScope.marcadoresFavoritos[index].setMap(null);
                            $rootScope.marcadoresFavoritosGlobal[index].setMap(null);
                            $rootScope.marcadoresFavoritos.splice(index, 1);
                            window.localStorage.setItem('favoritos', JSON.stringify($rootScope.arrayFavoritos));
                        }
    
                    }
                } else {
                    console.log('You are not sure');
                }
            });
        };
        $scope.showConfirm();
     };

    var array = window.localStorage.getItem('favoritos');
    var arrayFav = JSON.parse(array);
    $rootScope.marcadoresFavoritos = new Array();
    $rootScope.infoWindowsFavoritos = new Array();
    $rootScope.marcadoresFavoritosGlobal = new Array();
    if(arrayFav === null)
    {
        arrayFav = [];
    }
    for(var i = 0; i<arrayFav.length; i++)
    {
        console.log(arrayFav[i]);
        if(arrayFav[i] !== null)
        {
            var content = '<div id="iw-container">' +
                        '<div class="iw-title">Favorito ' + arrayFav[i].nombreFav + '</div>' +
                        '<div class="iw-content">' +
                            '<div class="iw-subTitle">Información</div>' +
                            '<ul><li><b>Posición: </b><ul><li>Latitud: ' + arrayFav[i].latitud + '</li><li>Longitud:' + arrayFav[i].longitud + '</li></ul></li><li><b>Modo de transporte: ' + arrayFav[i].modoTransporte + '</b></li></ul>' +
                        '<button ng-click="eliminarFav(' + arrayFav[i].latitud + ',' + arrayFav[i].longitud + ', true,'+i+')">Eliminar favorito</button>' +
                        '<button ng-click="buscarRutaAqui(' + arrayFav[i].latitud + ',' + arrayFav[i].longitud + ',&quot;' + arrayFav[i].modoTransporte + '&quot;)">Ir aquí</button>' +
                        '</div>' +
                        '<div class="iw-bottom-gradient"></div>' +
                        '</div>';
            compiled = $compile(content)($rootScope);
            infowindow = new google.maps.InfoWindow({
                maxWidth: 350
            });

            marker = new google.maps.Marker({
                position: new google.maps.LatLng(arrayFav[i].latitud, arrayFav[i].longitud),
                title: "Favorito "+ arrayFav.nombreFav,
                icon: 'img/fav.png',
                content: compiled[0],
                dataId: i
            });

            marker2 = new google.maps.Marker({
                position: new google.maps.LatLng(arrayFav[i].latitud, arrayFav[i].longitud),
                title: "Favorito "+ arrayFav.nombreFav,
                icon: 'img/fav.png',
                content: compiled[0],
                dataId: i
            });

            $rootScope.marcadoresFavoritos.push(marker);
            $rootScope.marcadoresFavoritosGlobal.push(marker2);
            $rootScope.infoWindowsFavoritos.push(infowindow);

            google.maps.event.addListener(marker, 'click', function () {
                infowindow.setContent(this.content);
                infowindow.open($rootScope.map, this);
            });
        }
    }
    $rootScope.arrayFavoritos = arrayFav;
    window.localStorage.setItem('favoritos', JSON.stringify(arrayFav));
    $rootScope.posActual;
    navigator.geolocation.getCurrentPosition(function (pos) {
        $rootScope.posActual = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    }, function (error) {
        var errorF = function () {
            var alertPopup = $ionicPopup.alert({
                title: 'No hay conexión a Internet',
                template: '<p>No se puede conectar al sistema porque no hay Internet. Compruebe su conexión.<br>Nota: El sistema no funcionará correctamente sin conexión.</p>'
            });

            alertPopup.then(function (res) {

            });
        };
        errorF();
    });

    $ionicModal.fromTemplateUrl('favorito.html', function ($ionicModal) {
        $rootScope.favorito = $ionicModal;
    }, {
        // Use our scope for the scope of the modal to keep it simple
        scope: $rootScope,
        // The animation we want to use for the modal entrance
        animation: 'slide-in-up'
    });
    var mapElegirFav;
    $rootScope.abrirAnadirFav = function () {
        //mostrar Modal
        $rootScope.favorito.show();

        //Crear mapa
        //var inticor = new google.maps.LatLng(43.262979, -2.934911);
        //console.log("Primera");
            var mapOptions = {
                zoom: 10,
                center: new google.maps.LatLng(43.262980, -2.934883),
                mapTypeId: google.maps.MapTypeId.ROADMAP,
            };
            mapElegirFav = new google.maps.Map(document.getElementById('favorito'), mapOptions);
    }
    var marker;
    $rootScope.puntoAAnadir = "";
    $rootScope.elegirFav = function (punto) {
        console.log("En fav: " + punto);

        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({ 'address': punto }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                //alert(results[0].geometry.location);
                var puntoLocalizacion = results[0].geometry.location;
                if(marker !== undefined)
                {
                    marker.setMap(null);
                }

                var bounds = new google.maps.LatLngBounds();
                marker = new google.maps.Marker({
                    map: mapElegirFav,
                    animation: google.maps.Animation.DROP,
                    title: punto,
                    position: puntoLocalizacion
                });

                bounds.extend(puntoLocalizacion);
                $rootScope.puntoAAnadir = puntoLocalizacion;
                mapElegirFav.setCenter(puntoLocalizacion);
                mapElegirFav.setZoom(15);
            } else {
                alert("No se pudo obtener el punto exacto por: " + status);
            }
        });
    };
    $rootScope.anadirFavH = function(nombre, transporte, punto){
        if(nombre !== undefined && transporte !== undefined && punto !== undefined)
        {
            //añadir Favorito
            var array = window.localStorage.getItem('favoritos');
            if (array === null) {
                var arrayFav = new Array();
                console.log($rootScope.puntoAAnadir);
                arrayFav.push({ nombreFav: nombre, latitud: $rootScope.puntoAAnadir.lat(), longitud: $rootScope.puntoAAnadir.lng(), modoTransporte: transporte });
                window.localStorage.setItem('favoritos', JSON.stringify(arrayFav));
            }
            else {
                var arrayFav = JSON.parse(array);
                console.log($rootScope.puntoAAnadir);
                arrayFav.push({ nombreFav: nombre, latitud: $rootScope.puntoAAnadir.lat(), longitud: $rootScope.puntoAAnadir.lng(), modoTransporte: transporte });
                window.localStorage.setItem('favoritos', JSON.stringify(arrayFav));
            }

            //$rootScope.marcadorFav.setMap(null);

            var content = '<div id="iw-container">' +
                                '<div class="iw-title">Favorito ' + nombre + '</div>' +
                                '<div class="iw-content">' +
                                    '<div class="iw-subTitle">Información</div>' +
                                    '<ul><li><b>Posición: </b><ul><li>Latitud: ' + $rootScope.puntoAAnadir.lat() + '</li><li>Longitud:' + $rootScope.puntoAAnadir.lng() + '</li></ul></li><li><b>Modo de transporte: ' + transporte + '</b></li></ul>' +
                                '<button ng-click="eliminarFav(' + $rootScope.puntoAAnadir.lat() + ',' + $rootScope.puntoAAnadir.lng() + ', true, ' + $rootScope.marcadoresFavoritos.length + ')">Eliminar favorito</button>' +
                                '<button ng-click="buscarRutaAqui(' + $rootScope.puntoAAnadir.lat() + ',' + $rootScope.puntoAAnadir.lng() + ',&quot;' + transporte + '&quot;)">Ir aquí</button>' +
                                '</div>' +
                                '<div class="iw-bottom-gradient"></div>' +
                                '</div>';
            var compiled = $compile(content)($rootScope);
            var infowindow = new google.maps.InfoWindow({
                content: compiled[0],
                maxWidth: 350
            });

            var marker = new google.maps.Marker({
                position: new google.maps.LatLng($rootScope.puntoAAnadir.lat(), $rootScope.puntoAAnadir.lng()),
                title: "Favorito" + nombre,
                icon: 'img/fav.png',
            });

            var marker2 = new google.maps.Marker({
                position: new google.maps.LatLng($rootScope.puntoAAnadir.lat(), $rootScope.puntoAAnadir.lng()),
                title: "Favorito " + nombre,
                icon: 'img/fav.png',
                content: compiled[0],
                dataId: i
            });

            $rootScope.infoWindowsFavoritos.push(infowindow);
            $rootScope.marcadoresFavoritosGlobal.push(marker2);
            $rootScope.marcadoresFavoritos.push(marker);

            //se añade un evento al marcador
            google.maps.event.addListener(marker, 'click', function () {
                infowindow.open($rootScope.map, marker);
            });

            marker.setMap($rootScope.map);
            $rootScope.arrayFavoritos.push({ nombreFav: nombre, latitud: $rootScope.puntoAAnadir.lat(), longitud: $rootScope.puntoAAnadir.lng(), modoTransporte: transporte });
            $rootScope.correctoFav({ nombreFav: nombre, latitud: $rootScope.puntoAAnadir.lat(), longitud: $rootScope.puntoAAnadir.lng(), modoTransporte: transporte });
            $rootScope.favorito.hide();
            $rootScope.nombre = "";
            $rootScope.transporte = "";
            $rootScope.puntoFav = "";
        }
        else
        {
            //mal inserccion
            var showAlert = function () {
                var alertPopup = $ionicPopup.alert({
                    title: 'Faltan campos',
                    template: 'No se han introducido todos los parámetros necesarios del formulario. Revise los campos.'
                });

                alertPopup.then(function (res) {
                    
                });
            };
            showAlert();
        }
        
    };
    $rootScope.buscarRutaAqui = function (latitud, longitud, modo) {
        $rootScope.modo = modo;
        console.log("En HomeController " + modo);
        $rootScope.busquedaRealizada = true;
        $rootScope.conClick = true;
        $rootScope.destinoDesdeFav = new google.maps.LatLng(latitud, longitud);
        $state.go('menu.track-map');
    }
    $ionicLoading.hide();
});
