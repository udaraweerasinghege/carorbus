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


      var distanceReq = DistanceAPI.getDistanceMatrix(distanceArgs);      
      var carInfoReq = $http.get(`https://api.edmunds.com/api/vehicle/v2/${$scope.car.make}/${$scope.car.model}/${$scope.car.year}/styles?api_key=${carInfoApiKey}&view=full`);

      // get city info.
      var city;
      var province;
      for (let item of $scope.origin.address_components) {
        if (item.types.join() === 'locality,political' && !city) {
          city = item.long_name ? item.long_name : null;
        } 
        if (item.types.join() === 'administrative_area_level_1,political' && !province) {
          province = item.long_name ? item.long_name : null;
        }
        
      }
      console.log(city, province);
      var location = `${city}, ${province}`
      var gasReq = $http.post(gasPriceAPI, {"postal_code": location}, {"Headers": {"Content-Type": "application/json"}}) 
      
      var promises = [distanceReq, carInfoReq, gasReq]
      $q.all(promises)
        .then(function(values) {
          // console.log(values);
          // this will have lat and long
          console.log(values);
          var distanceMatrixResp = values[0];
          var element = distanceMatrixResp.rows[0].elements[0];
          $scope.duration = element.duration.text;
          $scope.distance = element.distance.text;

          var fistCar = values[1].data.styles[0];
          var mpg = fistCar.MPG.city;
          $scope.mpg = mpg;
          console.log(values[2])
          $scope.gasPrice = values[2].data.body;
          
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
