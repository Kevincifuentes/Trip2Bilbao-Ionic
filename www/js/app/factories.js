angular.module('blusecur.factories', [])

.factory('iAd', function ($window) {
    var iAd = $window.iAd;

    // preppare and load ad resource in background, e.g. at begining of game level
    if (iAd) {
        iAd.prepareInterstitial({ autoShow: false });
    }
    else {
        console.log("No iAd?");
    }

    return {
        showBanner: function () {
            if (iAd) {
                // show a default banner at bottom
                iAd.createBanner({
                    position: iAd.AD_POSITION.BOTTOM_CENTER,
                    autoShow: true
                });
            }
        },
        showInterstitial: function () {
            // ** Notice: iAd interstitial Ad only supports iPad.
            if (iAd) {
                // If you did prepare it before, then show it like this
                // 		- (for example: check and show it at end of a game level)
                iAd.showInterstitial();
            }
        },
        removeAds: function () {
            if (iAd) {
                iAd.removeBanner();
            }
        }
    };
})

.factory('promiseFactory', function($q) {
  return {
    decorate: function(promise) {
      promise.success = function(callback) {
        promise.then(callback);

        return promise;
      };

      promise.error = function(callback) {
        promise.then(null, callback);

        return promise;
      };
    },
    defer: function() {
      var deferred = $q.defer();

      this.decorate(deferred.promise);

      return deferred;
    }
  };
});