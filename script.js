// declare a module
var matrixKey = 'AIzaSyAocy0wxZ_HEmrp2C6iRDsjJzaUSp8MqHU';
var carInfoApiKey = 'j2mjhrhftx2k5kpvjmycctkf';
var app = angular.module('app', ['google.places', 'angular.google.distance']);

// configure the module.
// in this example we will create a greeting filter
app.controller('mainController', ['$scope', '$http', 'GoogleDistanceAPI', '$q', function($scope, $http, DistanceAPI, $q) {
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
      var carInfoReq = $http.get(`https://api.edmunds.com/api/vehicle/v2/${$scope.car.make}/${$scope.car.model}/${$scope.car.year}/styles?api_key=${carInfoApiKey}`);
      var gasInfoReq = $http.jsonp(`http://api.mygasfeed.com/stations/radius/${lat}/${long}/10/reg/price/rfej9napna`, {})
      promises.push(carInfoReq);
      promises.push(gasInfoReq);

      $q.all(promises)
      .then(function(values) {
        console.log(values);
        // this will have lat and long
        var distanceMatrixResp = values[0];
        var element = distanceMatrixResp.rows[0].elements[0];
        $scope.duration = element.duration.text;
        $scope.distance = element.distance.text;
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