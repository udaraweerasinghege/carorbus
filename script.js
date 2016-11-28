// declare a module
var matrixKey = 'AIzaSyAocy0wxZ_HEmrp2C6iRDsjJzaUSp8MqHU';
var carInfoApiKey = 'j2mjhrhftx2k5kpvjmycctkf';
var gMapsKey = 'AIzaSyB27bkDRtChsWGdiCa1uPPSMqX0z1S0c2E';
var gasPriceAPI = 'https://wcypeu4s4j.execute-api.us-west-2.amazonaws.com/prod/lambda_handler';
var app = angular.module('app', ['google.places', 'angular.google.distance']);

// configure the module.
// in this example we will create a greeting filter
app.controller('mainController', ['$scope', '$http', 'GoogleDistanceAPI', '$q', '$window', function($scope, $http, DistanceAPI, $q, $window) {
  // set google maps to only work with canada.
  $scope.car = {
    make: null,
    year: null,
    model: null
  }

  $scope.autocompleteOptions = {
    componentRestrictions: { country: 'ca' }
  };

  $scope.submit = function() {
    $http.get('http://ipinfo.io')
    .then(function(locationResp) {
      var locationData = locationResp.data.loc.split(',');
      var lat = locationData[0];
      var long = locationData[1];
      var distanceArgs = {
        origins: [$scope.origin['formatted_address']],
        destinations: [$scope.destination['formatted_address']]
      };
      var promises = [DistanceAPI.getDistanceMatrix(distanceArgs)];
      var carInfoReq = $http.get(`https://api.edmunds.com/api/vehicle/v2/${$scope.car.make}/${$scope.car.model}/${$scope.car.year}/styles?api_key=${carInfoApiKey}&view=full`);
      promises.push(carInfoReq);
      $q.all(promises)
        .then(function(values) {
          console.log(values);
          // this will have lat and long
          var distanceMatrixResp = values[0];
          var element = distanceMatrixResp.rows[0].elements[0];
          $scope.duration = element.duration.text;
          $scope.distance = element.distance.text;

          var fistCar = values[1].data.styles[0];
          var mpg = fistCar.MPG.city;
          $scope.mpg = mpg;

          var geocoder = new $window.google.maps.Geocoder();
          geocoder.geocode({'address': $scope.origin['formatted_address']}, function(results, status) {
            if (results[0]) {
              for (var i = 0; i < results[0].address_components.length; i++) {
                  var types = results[0].address_components[i].types;

                  for (var typeIdx = 0; typeIdx < types.length; typeIdx++) {
                      if (types[typeIdx] == 'postal_code') {
                          //console.log(results[0].address_components[i].long_name);
                          var postalCode = results[0].address_components[i].short_name;
                      }
                  }
              }
            } else {
              console.log("No results found");
            }
            // make request to gasbuddy...
            $http.post('https://www.gasbuddy.com/Home/Search', {'s': postalCode})
              .then(items => {
                console.log(items);
              }) 
          });
        })
    })
    
  };

  function display() {

  };
}]);

app.directive('carQuery', [function() {
  return {
    restrict: 'A',
    link: function(scope, elem, attrs) {
      var carquery = new CarQuery();
      carquery.init();
      carquery.initYearMakeModelTrim('car-years', 'car-makes', 'car-models');
    }
  }
}])