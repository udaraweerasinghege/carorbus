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
    var distanceArgs = {
      origins: [$scope.origin['formatted_address']],
      destinations: [$scope.destination['formatted_address']]
    };
    var promises = [DistanceAPI.getDistanceMatrix(distanceArgs)];
    var carInfoReq = $http.get(`https://api.edmunds.com/api/vehicle/v2/${$scope.car.make}/${$scope.car.model}/${$scope.car.year}/styles?api_key=${carInfoApiKey}`);
    promises.push(carInfoReq);

    $q.all(promises)
    .then(function(values) {
      console.log(values);
      // this will have lat and long
      let distanceMatrixResp = values[0];
      let element = distanceMatrixResp.rows[0].elements[0];
      $scope.duration = element.duration.text;
      $scope.distance = element.distance.text;
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