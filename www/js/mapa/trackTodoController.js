﻿angular.module('blusecur.mapa.controllers', [])

.controller('TrackMapTodoCtrl', function ($rootScope, $timeout, $interval, $ionicPopup, $state, $stateParams, $filter, $translate, store, jwtHelper, $ionicModal, CrossingService, VesselService, CrewService, ContactsService, LovsService, LocationService, uiGmapGoogleMapApi, $http) {
    //PROVISIONAL""
    $rootScope.estadosParking = {};
    $rootScope.estadosBici = {};
    $rootScope.estadosParking["Karmelo"] = 10;
    $rootScope.estadosBilbobus = {};
    ////
    //Crear elecciones

    //Inicializar mapa
    var iconos = ["img/defecto.png", "img/farmacias.png", "img/parking.png", "img/incidencias.png", "img/centros.png", "img/hospitales.png", "img/bilbobus.png", "img/bizkaibus.png", "img/euskotren.png", "img/metro.png", "img/tranvia.png", "img/puntobici.png"];
    var inticor = new google.maps.LatLng(43.262979, -2.934911);
    var mapOptions = {
        zoom: 13,
        center: inticor,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
    };
    var trafficLayer = new google.maps.TrafficLayer();
    var map = new google.maps.Map(document.getElementById('googleMap2'), mapOptions);
    trafficLayer.setMap(map);

    //LEYENDA
    var controlesDiv = document.createElement('DIV');
    var controles = new CrearLeyenda(controlesDiv, map, $rootScope);
    controlesDiv.index = 3;
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlesDiv);

    //ARRAYS DE MARKERS
    var parkings = new Array();
    var metro = new Array();
    var bicis = new Array();
    var tranvia = new Array();
    var euskotren = new Array();
    var bizkaibus = new Array();
    var bilbobus = new Array();
    var incidencias = new Array();
    var hospitales = new Array();
    var farmacias = new Array();
    var centros = new Array();


    //ARRAYS DE INFOWINDOWS
    var infoWinParking = new Array();
    var infoWinMetro = new Array();
    var infoWinBicis = new Array();
    var infoWinTranvia = new Array();
    var infoWinEuskotren = new Array();
    var infoWinBizkaibus = new Array();
    var infoWinBilbobus = new Array();
    var infoWinIncidencias = new Array();
    var infoWinHospitales = new Array();
    var infoWinFarmacias = new Array();
    var infoWinCentros = new Array();

    var formatearInfo = function (tipo, item) {
        switch(tipo) {
            case 1:
                return "<div id='iw-container'><div class='iw-title'><b>" + item.nombreFarmacia + "</b></div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b> Dirección:</b> " + item.direccionAbreviada + "</li><li type='square'><b> Contácto:</b> " + item.telefono + "</li></ul></div><div class='iw-bottom-gradient'></div></div>";
                break;
            case 2:
                if(item.nombreParking in $rootScope.estadosParking)
                {
                    return "<div id='iw-container'><div class='iw-title'><b>Parking:</b> " + item.nombreParking + "</div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b> Capacidad: </b> " + item.capacidad + "</li></ul><br><h4><b> Disponibilidad actual: </b>" + $rootScope.estadosParking[item.nombreParking] + "</h4></div><div class='iw-bottom-gradient'></div></div>";
                }
                else {
                    return "<div id='iw-container'><div class='iw-title'><b>Parking:</b> " + item.nombreParking + "</div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b> Capacidad: </b> " + item.capacidad + "</li></ul></div><div class='iw-bottom-gradient'></div></div>";
                }
            case 3:
                return "<div id='iw-container'><div class='iw-title'><b>" + item.tipo + "</b></div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b> Descripción: </b> " + item.descripcion + "</li><li type='square'><b>Fecha Inicio:</b> " + item.inicio + "</li><li type='square'><b>Fecha Fin: </b>" + item.fin + "</li></ul></div><div class='iw-bottom-gradient'></div></div>";
            case 4:
                return "<div id='iw-container'><div class='iw-title'><b>Centro de Salud:</b> " + item.nombreCentro + "</div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b>Dirección:</b> " + item.direccionCompleta + "</li><li type='square'><b>Horario:</b> " + item.horario + "</li><li type='square'><b>Teléfono:<b> " + item.telefono + "</li></ul><a href='" + item.web + "' class='button' target='_blank'><b>Página web:</b></a></div><div class='iw-bottom-gradient'></div></div>";
            case 5:
                return "<div id='iw-container'><div class='iw-title'><b>Hospital:</b> " + item.nombreHospital + "</div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b>Dirección:</b> " + item.direccionCompleta + "</li><li type='square'><b>Teléfono:<b> " + item.telefono + "</li></ul><a href='" + item.web + "' class='button' target='_blank'><b>Página web:</b></a></div><div class='iw-bottom-gradient'></div></div>";
            case 6:
                return "<div id='iw-container'><div class='iw-title'><b>Parada de Bilbobus:</b> " + item.nombreParada + "</div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b>Abreviatura:</b> " + item.abreviatura + "</li></ul><table border='1' style='width:100%' border-spacing='5px' ><tr><th>Id de Linea</th><th>Nombre de Linea</th><th>Tiempo Restante</th></tr>";
                var inicial = "<div><h3><b>Parada de Bilbobus:</b> " + item.nombreParada + "</h3><br><b>Abreviatura:</b><table border='1' style='width:100%' border-spacing='5px' ><tr><th>Id de Linea</th><th>Nombre de Linea</th><th>Tiempo Restante</th></tr>" + item.abreviatura;
                if (item.id in $rootScope.estadosBilbobus) {
                    var tiempos = $rootScope.estadosBilbobus[item.id];
                    for (var i = 0; i < tiempos.length; i++) {
                        inicial = inicial + "<tr><td>" + tiempos[i].id + "</td><td>" + tiempos[i].linea + "</td><td>" + tiempos[i].tiempo + "</td></tr>";
                    }
                }
                inicial = inicial + "</table></div><div class='iw-bottom-gradient'></div></div>";
                return inicial;
            case 7:
                return "<div id='iw-container'><div class='iw-title'><b>Parada de Bizkaibus:</b> " + item.nombreParada + "</div></div>";
            case 8:
                if (item.web === undefined)
                {
                    return "<div id='iw-container'><div class='iw-title'><b>Parada de Euskotren:</b> " + item.nombreParada + "</div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b>Código de parada:</b> " + item.codigoParada + "</li></ul></div><div class='iw-bottom-gradient'></div></div>";
                }
                else {
                    return "<div id='iw-container'><div class='iw-title'><b>Parada de Euskotren:</b> " + item.nombreParada + "</div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b>Código de parada:</b> " + item.codigoParada + "</li></ul><a href='" + item.web + "' class='button' target='_blank'><b>Página web:</b></a></div><div class='iw-bottom-gradient'></div></div>";
                }
            case 9:
                return "<div id='iw-container'><div class='iw-title'><b>Parada de Metro:</b> " + item.nombreParada + "</div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b>Código de parada:</b> " + item.codigoParada + "</li></ul><a href='https://www.metrobilbao.eus/utilizando-el-metro/mapa-y-frecuencias' class='button' target='_blank'>Más información...</a></div><div class='iw-bottom-gradient'></div></div>";
            case 10:
                return "<div id='iw-container'><div class='iw-title'><b>Parada de Tranvía:</b> " + item.nombreParada + "</div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b>Localización:</b> " + item.descripcion + "</li></ul></div><div class='iw-bottom-gradient'></div></div>";
            case 11:
                if (item.nombrePunto in $rootScope.estadosBici)
                {
                    return "<div id='iw-container'><div class='iw-title'><b>Punto de bicis:</b> " + item.nombrePunto + "</div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b>Estado:</b> " + item.estado + "</li><li type='square'><b>Capacidad:</b> " + item.capacidad + "</li></ul><h4>Disponibilidad en Tiempo Real</h4>" + estadosBici[item.nombrePunto] + "</div><div class='iw-bottom-gradient'></div></div>";
                }
                else {
                    return "<div id='iw-container'><div class='iw-title'><b>Punto de bicis:</b> " + item.nombrePunto + "</div><div class='iw-content'><div class='iw-subTitle'>Información</div><ul><li type='square'><b>Estado:</b> " + item.estado + "</li><li type='square'><b>Capacidad:</b> " + item.capacidad + "</li></ul></div><div class='iw-bottom-gradient'></div></div>";
                }
            default:
                console.log(tipo);
        }
    }

    obtenerInfo = function (path, tipo) {
        $http({ method: 'GET', url: path})
        .success(function (data, status) {
            //si la petición ha sido correcta, tendremos una lista de objetos JSON

            angular.forEach(data, function (item, key) {

                var contentString = formatearInfo(tipo, item);
                var infowindow = new google.maps.InfoWindow({
                    content: contentString,
                    maxWidth: 350
                });
                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(item.latitud, item.longitud),
                    title: contentString,
                    icon: iconos[tipo]
                });

                switch(tipo)
                {
                    case 1:
                        farmacias.push(marker);
                        infoWinFarmacias.push(infowindow);
                        break;

                    case 2:
                        parkings.push(marker);
                        infoWinParking.push(infowindow);
                        break;

                    case 3:
                        incidencias.push(marker);
                        infoWinIncidencias.push(infowindow);
                        break;

                    case 4:
                        centros.push(marker);
                        infoWinCentros.push(infowindow);
                        break;

                    case 5:
                        hospitales.push(marker);
                        infoWinHospitales.push(infowindow);
                        break;

                    case 6:
                        bilbobus.push(marker);
                        infoWinBilbobus.push(infowindow);
                        break;

                    case 7:
                        bizkaibus.push(marker);
                        infoWinBizkaibus.push(infowindow);
                        break;

                    case 8:
                        euskotren.push(marker);
                        infoWinEuskotren.push(infowindow);
                        break;

                    case 9:
                        metro.push(marker);
                        infoWinMetro.push(infowindow);
                        break;

                    case 10:
                        tranvia.push(marker);
                        infoWinTranvia.push(infowindow);

                    case 11:
                        bicis.push(marker);
                        infoWinBicis.push(infowindow);
                        break;
                }
                

                //se añade un evento al marcador
                google.maps.event.addListener(marker, 'click', function () {
                    infowindow.open(map, marker);
                });
                if (tipo === 2)
                {
                    marker.setMap(map);
                }
            });
        }).error(function (data, status) {
            console.log(status);
            alert("Error al obtener información, compruebe su conexión a Internet");
        }).finally(function () {
            if(tipo ===2)
            {
                var bounds = new google.maps.LatLngBounds();
                for (var i = 0; i < marcadores.length; i++) {
                    bounds.extend(marcadores[i]);
                }
                map.fitBounds(bounds);
            }
        });
    };

    obtenerInfo("http://localhost:16422/api/parkings/parkings/", 2);
    obtenerInfo("http://localhost:16422/api/paradasmetro/paradasmetro/", 9);
    obtenerInfo("http://localhost:16422/api/puntosbici/puntosbici/", 11);
    obtenerInfo("http://localhost:16422/api/paradastranvia/paradastranvia/", 10);
    obtenerInfo("http://localhost:16422/api/paradaseuskotren/paradaseuskotren/", 8);
    obtenerInfo("http://localhost:16422/api/paradasbizkaibus/paradasbizkaibus/", 7);
    obtenerInfo("http://localhost:16422/api/paradasbilbo/paradasbilbo/", 6);
    obtenerInfo("http://localhost:16422/api/incidencias/fecha/", 3);
    obtenerInfo("http://localhost:16422/api/hospitales/hospitales/", 5);
    obtenerInfo("http://localhost:16422/api/farmacias/farmacias/", 1);
    obtenerInfo("http://localhost:16422/api/centros/centros/", 4);

    //CREACION DEL MENU DE MARKERS
    function CrearLeyenda(controlesDiv, map) {

        controlesDiv.style.padding = '5px 0px';
        var controlesUI = document.createElement('DIV');
        controlesUI.style.backgroundColor = 'white';
        controlesUI.style.borderStyle = 'solid';
        controlesUI.style.borderWidth = '1px';
        controlesUI.style.borderColor = 'gray';
        controlesUI.style.boxShadow = 'rgba(0, 0, 0, 0.398438) 0px 2px 4px';
        controlesUI.style.cursor = 'pointer';
        controlesUI.style.textAlign = 'center';
        controlesUI.title = 'Click to see Churches';
        controlesDiv.appendChild(controlesUI);

        //CHECKBOX DE PARKINGS
        var checkbox = document.createElement('input');
        checkbox.style.width = '15px';
        checkbox.style.height = '15px';
        checkbox.type = "checkbox";
        checkbox.name = "name";
        checkbox.value = "value";
        checkbox.id = "parking";
        checkbox.checked = true;
        checkbox.onclick = function () {
            // access properties using this keyword
            if (this.checked) {
                // SI ESTA MARCADO
                if (parkings.length < 1) {
                    obtenerInfo("http://localhost:16422/api/parkings/parkings/", 2);
                }
                else {
                    for (var i = 0; i < parkings.length; i++) {
                        parkings[i].setMap(map);
                    }
                }
            } else {
                // SI NO ESTA MARCADO
                for (var i = 0; i < parkings.length; i++) {
                    parkings[i].setMap(null);
                }
            }
        };

        var label = document.createElement('label')
        label.htmlFor = "id";
        label.appendChild(document.createTextNode('Parkings'));

        controlesUI.appendChild(checkbox);
        controlesUI.appendChild(label);

        controlesUI.appendChild(document.createElement('br'));

        //CHECKBOX DE METRO
        var checkbox = document.createElement('input');
        checkbox.style.width = '15px';
        checkbox.style.height = '15px';
        checkbox.type = "checkbox";
        checkbox.name = "name";
        checkbox.value = "value";
        checkbox.id = "metro";
        checkbox.checked = false;
        checkbox.onclick = function () {
            // access properties using this keyword
            if (this.checked) {
                // SI ESTA MARCADO
                if (metro.length < 1) {
                    obtenerInfo("http://localhost:16422/api/paradasmetro/paradasmetro/", 9);
                }
                else {
                    for (var i = 0; i < metro.length; i++) {
                        metro[i].setMap(map);
                    }
                }
            } else {
                // SI NO ESTA MARCADO
                for (var i = 0; i < metro.length; i++) {
                    metro[i].setMap(null);
                }
            }
        };

        var label = document.createElement('label')
        label.htmlFor = "id";
        label.appendChild(document.createTextNode('Metro'));

        controlesUI.appendChild(checkbox);
        controlesUI.appendChild(label);

        controlesUI.appendChild(document.createElement('br'));

        //CHECKBOX DE BICIS
        var checkbox = document.createElement('input');
        checkbox.style.width = '15px';
        checkbox.style.height = '15px';
        checkbox.type = "checkbox";
        checkbox.name = "name";
        checkbox.value = "value";
        checkbox.id = "bicis";
        checkbox.checked = false;
        checkbox.onclick = function () {
            // access properties using this keyword
            if (this.checked) {
                // SI ESTA MARCADO
                if (bicis.length < 1) {
                    obtenerInfo("http://localhost:16422/api/puntosbici/puntosbici/", 11);
                }
                else {
                    for (var i = 0; i < bicis.length; i++) {
                        bicis[i].setMap(map);
                    }
                }
            } else {
                // SI NO ESTA MARCADO
                for (var i = 0; i < bicis.length; i++) {
                    bicis[i].setMap(null);
                }
            }
        };

        var label = document.createElement('label')
        label.htmlFor = "id";
        label.appendChild(document.createTextNode('Bicicletas'));

        controlesUI.appendChild(checkbox);
        controlesUI.appendChild(label);

        controlesUI.appendChild(document.createElement('br'));

        //CHECKBOX DE TRANVIA
        var checkbox = document.createElement('input');
        checkbox.style.width = '15px';
        checkbox.style.height = '15px';
        checkbox.type = "checkbox";
        checkbox.name = "name";
        checkbox.value = "value";
        checkbox.id = "tranvia";
        checkbox.checked = false;
        checkbox.onclick = function () {
            // access properties using this keyword
            if (this.checked) {
                // SI ESTA MARCADO
                if (tranvia.length < 1) {
                    obtenerInfo("http://localhost:16422/api/paradastranvia/paradastranvia/", 10);
                }
                else {
                    for (var i = 0; i < tranvia.length; i++) {
                        tranvia[i].setMap(map);
                    }
                }
            } else {
                // SI NO ESTA MARCADO
                for (var i = 0; i < tranvia.length; i++) {
                    tranvia[i].setMap(null);
                }
            }
        };

        var label = document.createElement('label')
        label.htmlFor = "id";
        label.appendChild(document.createTextNode('Tranvía'));

        controlesUI.appendChild(checkbox);
        controlesUI.appendChild(label);

        controlesUI.appendChild(document.createElement('br'));

        //CHECKBOX DE EUSKOTREN
        var checkbox = document.createElement('input');
        checkbox.style.width = '15px';
        checkbox.style.height = '15px';
        checkbox.type = "checkbox";
        checkbox.name = "name";
        checkbox.value = "value";
        checkbox.id = "euskotren";
        checkbox.checked = false;
        checkbox.onclick = function () {
            // access properties using this keyword
            if (this.checked) {
                // SI ESTA MARCADO
                if (euskotren.length < 1) {
                    obtenerInfo("http://localhost:16422/api/paradaseuskotren/paradaseuskotren/", 8);
                }
                else {
                    for (var i = 0; i < euskotren.length; i++) {
                        euskotren[i].setMap(map);
                    }
                }
            } else {
                // SI NO ESTA MARCADO
                for (var i = 0; i < euskotren.length; i++) {
                    euskotren[i].setMap(null);
                }
            }
        };

        var label = document.createElement('label')
        label.htmlFor = "id";
        label.appendChild(document.createTextNode('Euskotren'));

        controlesUI.appendChild(checkbox);
        controlesUI.appendChild(label);

        controlesUI.appendChild(document.createElement('br'));

        //CHECKBOX DE BIZKAIBUS
        var checkbox = document.createElement('input');
        checkbox.style.width = '15px';
        checkbox.style.height = '15px';
        checkbox.type = "checkbox";
        checkbox.name = "name";
        checkbox.value = "value";
        checkbox.id = "bizkaibus";
        checkbox.checked = false;
        checkbox.onclick = function () {
            // access properties using this keyword
            if (this.checked) {
                // SI ESTA MARCADO
                if (bizkaibus.length < 1) {
                    obtenerInfo("http://localhost:16422/api/paradasbizkaibus/paradasbizkaibus/", 7);
                }
                else {
                    for (var i = 0; i < bizkaibus.length; i++) {
                        bizkaibus[i].setMap(map);
                    }
                }
            } else {
                // SI NO ESTA MARCADO
                for (var i = 0; i < bizkaibus.length; i++) {
                    bizkaibus[i].setMap(null);
                }
            }
        };

        var label = document.createElement('label')
        label.htmlFor = "id";
        label.appendChild(document.createTextNode('Bizkaibus'));

        controlesUI.appendChild(checkbox);
        controlesUI.appendChild(label);

        controlesUI.appendChild(document.createElement('br'));

        //CHECKBOX DE BILBOBUS
        var checkbox = document.createElement('input');
        checkbox.style.width = '15px';
        checkbox.style.height = '15px';
        checkbox.type = "checkbox";
        checkbox.name = "name";
        checkbox.value = "value";
        checkbox.id = "bilbobus";
        checkbox.checked = false;
        checkbox.onclick = function () {
            // access properties using this keyword
            if (this.checked) {
                // SI ESTA MARCADO
                if (bilbobus.length < 1) {
                    obtenerInfo("http://localhost:16422/api/paradasbilbo/paradasbilbo/", 7);
                }
                else {
                    for (var i = 0; i < bilbobus.length; i++) {
                        bilbobus[i].setMap(map);
                    }
                }
            } else {
                // SI NO ESTA MARCADO
                for (var i = 0; i < bilbobus.length; i++) {
                    bilbobus[i].setMap(null);
                }
            }
        };

        var label = document.createElement('label')
        label.htmlFor = "id";
        label.appendChild(document.createTextNode('Bilbobus'));

        controlesUI.appendChild(checkbox);
        controlesUI.appendChild(label);

        controlesUI.appendChild(document.createElement('br'));

        //CHECKBOX DE INCIDENCIAS
        var checkbox = document.createElement('input');
        checkbox.style.width = '15px';
        checkbox.style.height = '15px';
        checkbox.type = "checkbox";
        checkbox.name = "name";
        checkbox.value = "value";
        checkbox.id = "incidencias";
        checkbox.checked = false;
        checkbox.onclick = function () {
            // access properties using this keyword
            if (this.checked) {
                // SI ESTA MARCADO
                if (incidencias.length < 1) {
                    obtenerInfo("http://localhost:16422/api/incidencias/fecha/", 3);
                }
                else {
                    for (var i = 0; i < incidencias.length; i++) {
                        incidencias[i].setMap(map);
                    }
                }
            } else {
                // SI NO ESTA MARCADO
                for (var i = 0; i < incidencias.length; i++) {
                    incidencias[i].setMap(null);
                }
            }
        };

        var label = document.createElement('label')
        label.htmlFor = "id";
        label.appendChild(document.createTextNode('Incidencias'));

        controlesUI.appendChild(checkbox);
        controlesUI.appendChild(label);

        controlesUI.appendChild(document.createElement('br'));

        //CHECKBOX DE HOSPITALES
        var checkbox = document.createElement('input');
        checkbox.style.width = '15px';
        checkbox.style.height = '15px';
        checkbox.type = "checkbox";
        checkbox.name = "name";
        checkbox.value = "value";
        checkbox.id = "hospitales";
        checkbox.checked = false;
        checkbox.onclick = function () {
            // access properties using this keyword
            if (this.checked) {
                // SI ESTA MARCADO
                if (hospitales.length < 1) {
                    obtenerInfo("http://localhost:16422/api/hospitales/hospitales/", 5);
                }
                else {
                    for (var i = 0; i < hospitales.length; i++) {
                        hospitales[i].setMap(map);
                    }
                }
            } else {
                // SI NO ESTA MARCADO
                for (var i = 0; i < hospitales.length; i++) {
                    hospitales[i].setMap(null);
                }
            }
        };

        var label = document.createElement('label')
        label.htmlFor = "id";
        label.appendChild(document.createTextNode('Hospitales'));

        controlesUI.appendChild(checkbox);
        controlesUI.appendChild(label);

        controlesUI.appendChild(document.createElement('br'));

        //CHECKBOX DE FARMACIAS
        var checkbox = document.createElement('input');
        checkbox.style.width = '15px';
        checkbox.style.height = '15px';
        checkbox.type = "checkbox";
        checkbox.name = "name";
        checkbox.value = "value";
        checkbox.id = "farmacias";
        checkbox.checked = false;
        checkbox.onclick = function () {
            // access properties using this keyword
            if (this.checked) {
                // SI ESTA MARCADO
                if (farmacias.length < 1) {
                    obtenerInfo("http://localhost:16422/api/farmacias/farmacias/", 7);
                }
                else {
                    for (var i = 0; i < farmacias.length; i++) {
                        farmacias[i].setMap(map);
                    }
                }
            } else {
                // SI NO ESTA MARCADO
                for (var i = 0; i < farmacias.length; i++) {
                    farmacias[i].setMap(null);
                }
            }
        };

        var label = document.createElement('label')
        label.htmlFor = "id";
        label.appendChild(document.createTextNode('Farmacias'));

        controlesUI.appendChild(checkbox);
        controlesUI.appendChild(label);

        controlesUI.appendChild(document.createElement('br'));

        //CHECKBOX DE Centros 
        var checkbox = document.createElement('input');
        checkbox.style.width = '15px';
        checkbox.style.height = '15px';
        checkbox.type = "checkbox";
        checkbox.name = "name";
        checkbox.value = "value";
        checkbox.id = "centros";
        checkbox.checked = false;
        checkbox.onclick = function () {
            // access properties using this keyword
            if (this.checked) {
                // SI ESTA MARCADO
                if (centros.length < 1) {
                    obtenerInfo("http://localhost:16422/api/centros/centros/", 4);
                }
                else {
                    for (var i = 0; i < centros.length; i++) {
                        centros[i].setMap(map);
                    }
                }
            } else {
                // SI NO ESTA MARCADO
                for (var i = 0; i < centros.length; i++) {
                    centros[i].setMap(null);
                }
            }
        };

        var label = document.createElement('label')
        label.htmlFor = "id";
        label.appendChild(document.createTextNode('Centros de salud'));

        controlesUI.appendChild(checkbox);
        controlesUI.appendChild(label);

        controlesUI.appendChild(document.createElement('br'));

        //CHECKBOX DE Favoritos 
        var checkbox = document.createElement('input');
        checkbox.style.width = '15px';
        checkbox.style.height = '15px';
        checkbox.type = "checkbox";
        checkbox.name = "name";
        checkbox.value = "value";
        checkbox.id = "favs";
        checkbox.checked = false;
        checkbox.onclick = function () {
            // access properties using this keyword
            if (this.checked) {
            console.log("marcado");
                // SI ESTA MARCADO
                for(var i =0; i<$rootScope.marcadoresFavoritos.length; i++)
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
            } else {
            console.log("sin marcar");
                for(var i =0; i<$rootScope.marcadoresFavoritos.length; i++)
                {
                    $rootScope.marcadoresFavoritosGlobal[i].setMap(null);
                }
            }
        };

        var label = document.createElement('label')
        label.htmlFor = "id";
        label.appendChild(document.createTextNode('Favoritos'));

        controlesUI.appendChild(checkbox);
        controlesUI.appendChild(label);

        google.maps.event.addDomListener(controlesUI, 'click', function () {
            if (controlesUI.style.fontWeight == 'bold') {
                controlesUI.style.fontWeight = 'normal';
            } else {
                controlesUI.style.fontWeight = 'bold';
            }
        });

        google.maps.event.addDomListener(controlesUI, 'mouseover', function () {
            controlesUI.style.backgroundColor = '#e8e8e8';
            controlesUI.style.fontSize = '35px';
        });

        google.maps.event.addDomListener(controlesUI, 'mouseout', function () {
            controlesUI.style.backgroundColor = 'white';
            controlesUI.style.fontSize = '14px';
        });
    }

    //AUTOCOMPLETAR
    /*if ($rootScope.primera === true) {
        $rootScope.primera = false;
        console.log("Es falso");
        navigator.geolocation.getCurrentPosition(function (pos) {
            $rootScope.map = { center: { latitude: pos.coords.latitude, longitude: pos.coords.longitude }, zoom: 8 };
            var miPos = {
                id: 0,
                coords: {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.logitude
                },
                options: { draggable: false },
                icon: 'img/marker.png',
                title : 
            };
            $rootScope.marcadores.push(miPos);
        }, function (error) {
            alert('Unable to get location: ' + error.message);
        });
    }*/

    /*$rootScope.mostrarBusqueda = function () {
        $rootScope.data = {};
        var myPopup = $ionicPopup.show({
            template: '<div class="input-group"><ion-google-place placeholder="Origen..." ng-model="origen" location-changed="prueba"></ion-google-place><ion-google-place placeholder="Destino..." ng-model="destino" location-changed="prueba"></ion-google-place></div>',
            title: 'Buscar ruta',
            subTitle: 'Introduce direcciones de origen y destino',
            scope: $rootScope,
            buttons: [
              { text: 'Cancelar' },
              {
                  text: '<b>Buscar</b>',
                  type: 'button-positive',
                  onTap: function(e) {
                      if (!$rootScope.data.origen && !$rootScope.data.destino) {
                          var showAlert = function () {
                              var alertPopup = $ionicPopup.alert({
                                  title: 'Ruta incompleta',
                                  template: 'Falta alguno de los parámetros necesarios para determinar la ruta'
                              });
                          };
                          showAlert();
                          e.preventDefault();
                      } else {
                          alert($rootScope.origen + " a " + $rootScope.destino);
                          return $rootScope.data;
                      }
                  }
              }
            ]
        });

        myPopup.then(function(res) {
            console.log('Tapped!', res);
        });
    };*/
});