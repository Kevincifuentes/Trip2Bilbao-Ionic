angular.module('trip2bilbao.meteo.controllers', [])

.controller('MeteoCtrl', function ($scope, $rootScope, $compile, $timeout, $interval, $ionicPopup, $state, $stateParams, $filter, $translate, jwtHelper, $ionicModal, uiGmapGoogleMapApi, $http, $cordovaNetwork, $cordovaGeolocation, $compile) {
    $scope.diahoy = new Date();
    $scope.diaManana = new Date();
    $scope.diaManana.setDate($scope.diahoy.getDate() + 1);
    $scope.diaPasado = new Date();
    $scope.diaPasado.setDate($scope.diaManana.getDate() + 1);
    $scope.hoy = $rootScope.meteo[0];
    $scope.manana = $rootScope.meteo[1];
    $scope.pasado = $rootScope.meteo[2];

})