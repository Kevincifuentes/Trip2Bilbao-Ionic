angular.module('blusecur.location.services', [
    'ui.router',
    'angular-storage'
])

.service('LocationService', function ($q, $http, store, jwtHelper, $state, $filter, config, CrossingService) {

    var track, waypoints, waypointsDB;
    var jwt = store.get('jwt');
    var decodedJwt = jwtHelper.decodeToken(jwt);
    var accountId = decodedJwt.accountId;

    /* distributed with this work for additional information
    * regarding copyright ownership.  The ASF licenses this file
    * to you under the Apache License, Version 2.0 (the
    * "License"); you may not use this file except in compliance
    * with the License.  You may obtain a copy of the License at
    *
    * http://www.apache.org/licenses/LICENSE-2.0
    *
    * Unless required by applicable law or agreed to in writing,
    * software distributed under the License is distributed on an
    * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    * KIND, either express or implied.  See the License for the
    * specific language governing permissions and limitations
    * under the License.
    */

    var app = {

        isTracking: false,
        aggressiveEnabled: false,
        postingEnabled: true,

        // Application Constructor
        initialize: function() {
            this.online = false;
            this.bindEvents();
        },
        
        // Bind any events that are required on startup. Common events are:
        // 'load', 'deviceready', 'offline', and 'online'.
        bindEvents: function() {
            document.addEventListener('deviceready', this.onDeviceReady, false);
            document.addEventListener('pause', this.onPause, false);
            document.addEventListener('resume', this.onResume, false);
            document.addEventListener("offline", this.onOffline, false);
            document.addEventListener("online", this.onOnline, false);
        },

        // deviceready Event Handler
        onDeviceReady: function() {
            app.ready = true;
            window.addEventListener('batterystatus', app.onBatteryStatus, false);
            app.configureBackgroundGeoLocation();
            backgroundGeoLocation.getLocations(app.postLocationsWasKilled);
            backgroundGeoLocation.watchLocationMode(app.onLocationCheck);
            if (app.online && app.wasNotReady) {
                app.postLocationsWasOffline()
            } else {
                waypointsDB = [];
            }
        },
        onLocationCheck: function (enabled) {
            if (app.isTracking && !enabled) {
                var showSettings = window.confirm('No location provider enabled. Should I open location setting?');
                if (showSettings === true) {
                    backgroundGeoLocation.showLocationSettings();
                }
            }
        },
        onBatteryStatus: function(ev) {
            app.battery = {
                level: ev.level / 100,
                is_charging: ev.isPlugged
            };
            console.log('[DEBUG]: battery', app.battery);
        },
        onOnline: function() {
            console.log('Online');
            app.online = true;
            if (!app.ready) {
                app.wasNotReady = true;
                return;
            }
            app.postLocationsWasOffline();
        },
        onOffline: function() {
            console.log('Offline');
            app.online = false;
        },
        getDeviceInfo: function () {
            return {
                model: device.model,
                version: device.version,
                platform: device.platform,
                uuid: md5([device.uuid, this.salt].join())
            };
        },
        configureBackgroundGeoLocation: function () {

            var anonDevice = app.getDeviceInfo();
            //This would be your own callback for Ajax-requests after POSTing background geolocation to your server.
            var yourAjaxCallback = function (response) {
                // After you Ajax callback is complete, you MUST signal to the native code
                backgroundGeoLocation.finish();
            };

            //This callback will be executed every time a geolocation is recorded in the background.
            var callbackFn = function(location) {
                var data = {
                    location: {
                        uuid: new Date().getTime(),
                        timestamp: location.time,
                        battery: app.battery,
                        coords: location,
                        service_provider: 'ANDROID_DISTANCE_FILTER'
                    },
                    device: anonDevice
                };
                console.log('[js] BackgroundGeoLocation callback:  ' + location.latitude + ',' + location.longitude);

                var filterdatetime = $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss.sss');
                var image = 'img/marker.png';
                var newWaypoint = {};
                var marker = {};

                newWaypoint.course = null;
                newWaypoint.heading = null;
                newWaypoint.lat = location.latitude;
                newWaypoint.lon = location.longitude;
                newWaypoint.speed = location.speed;
                newWaypoint.timestamp = filterdatetime;

                marker.latitude = location.latitude;
                marker.longitude = location.longitude;
                marker.icon = image;
                marker.timestamp = filterdatetime;

                //update the UI
                track.waypoints.push(newWaypoint);
                waypoints.push(marker);

                // post to server
                if (app.postingEnabled) {
                    //update the backend
                    CrossingService.newWaypoint(accountId, track.id, newWaypoint)
                    .success(function () {
                        //OK
                    })
                    .error(function () {
                        app.persistLocation(newWaypoint);
                    });
                }
                // After you Ajax callback is complete, you MUST signal to the native code, which is running a background-thread, that you're done and it can gracefully kill that thread.
                yourAjaxCallback.call(this);
            };

            var failureFn = function(err) {
                console.log('BackgroundGeoLocation err', err);
                window.alert('BackgroundGeoLocation err: ' + JSON.stringify(err));
            };

            // BackgroundGeoLocation is highly configurable.
            backgroundGeoLocation.configure(callbackFn, failureFn, {
                desiredAccuracy: 10, //0, 10, 100, 1000
                stationaryRadius: 10,
                distanceFilter: 10, //distance horizontal for update event
                locationTimeout: 10,
                //notificationIcon: 'img/marker.png',
                //notificationIconColor: '#FEDD1E',
                notificationTitle: 'BluSecur GPS tracking', // <-- android only, customize the title of the notification
                notificationText: 'Activado', // <-- android only, customize the text of the notification
                activityType: 'AutomotiveNavigation',
                debug: true, // <-- enable this for background-geolocation life-cycle messages.
                stopOnTerminate: false, // <-- enable this to clear background location settings when the app terminates
                //locationService: backgroundGeoLocation.service['ANDROID_DISTANCE_FILTER'],
                interval: 10000,
                fastestInterval: 20000,
                activitiesInterval: 20000
            });

            //Start
            app.startTracking();
        },
        getNativePosition: function() {
            var fgGeo = window.navigator.geolocation;

            // Your app must execute AT LEAST ONE call for the current position via standard Cordova geolocation,
            //  in order to prompt the user for Location permission.
            fgGeo.getCurrentPosition(
              function (location) {

                  console.log('[js] BackgroundGeoLocation native callback:  ' + location.coords.latitude + ',' + location.coords.longitude);

                  var filterdatetime = $filter('date')(new Date(), 'yyyy-MM-ddTHH:mm:ss.sss');
                  var image = 'img/marker.png';
                  var newWaypoint = {};
                  var marker = {};

                  newWaypoint.course = null;
                  newWaypoint.heading = null;
                  newWaypoint.lat = location.coords.latitude;
                  newWaypoint.lon = location.coords.longitude;
                  newWaypoint.speed = location.coords.speed;
                  newWaypoint.timestamp = filterdatetime;

                  marker.latitude = location.coords.latitude;
                  marker.longitude = location.coords.longitude;
                  marker.icon = image;
                  marker.timestamp = filterdatetime;

                  //update the UI
                  track.waypoints.push(newWaypoint);
                  waypoints.push(marker);

                  // post to server
                  if (app.postingEnabled) {
                      //update the backend
                      CrossingService.newWaypoint(accountId, track.id, newWaypoint)
                      .success(function () {
                          //OK
                      })
                      .error(function () {
                          app.persistLocation(newWaypoint);
                      });
                  }
              }, function (err) {
                  console.log('Error occured. Maybe check permissions', err);
                  window.alert('Error occured. Maybe check permissions');
              });
        },
        onPause: function() {
            console.log('- onPause');
        },
        onResume: function() {
            console.log('- onResume');
        },
        startTracking: function () {
            app.getNativePosition();
            backgroundGeoLocation.start();
            app.isTracking = true;
            backgroundGeoLocation.isLocationEnabled(app.onLocationCheck);
        },
        stopTracking: function () {
            app.getNativePosition();
            backgroundGeoLocation.stop();
            app.isTracking = false;
        },
        postLocationsWasOffline: function () {
            // nice recursion to prevent burst
            (function postOneByOne (locations) {
                var location = locations.pop();
                if (!location) {
                    return;
                }
                CrossingService.newWaypoint(accountId, track.id, location)
                .success(function () {
                    postOneByOne(locations);
                });
            })(waypointsDB || []);
        },
        persistLocation: function (location) {
            waypointsDB.push(location);
        },
        postLocationsWasKilled: function (locations) {
            
        }
    };

    this.initialize = function (selectedTrack, trackPoints) {
        track = selectedTrack;
        waypoints = trackPoints;
        //crossing.waypoints = [];
        app.initialize();
    }

    this.endTracking = function(){
        //crossing.waypoints = [];
        //crossing = null;
        app.stopTracking();
    }

});