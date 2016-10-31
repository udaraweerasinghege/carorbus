// declare a module
var matrixKey = 'AIzaSyAocy0wxZ_HEmrp2C6iRDsjJzaUSp8MqHU';
var carInfoApiKey = 'j2mjhrhftx2k5kpvjmycctkf';
var app = angular.module('app', ['google.places', 'angular.google.distance']);

// configure the module.
// in this example we will create a greeting filter
app.controller('mainController', ['$scope', '$http', 'GoogleDistanceAPI', function($scope, $http, DistanceAPI) {
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
    console.log($scope.car)
    var distanceArgs = {
      origins: [$scope.origin['formatted_address']],
      destinations: [$scope.destination['formatted_address']]
    };
    `https://api.edmunds.com/api/vehicle/v2/${$scope.car.make}/${$scope.car.model}/${scope.car.model}/styles?fmt=json&api_key=${carInfoApiKey}`;
    DistanceAPI.getDistanceMatrix(distanceArgs)
    .then(function(resp) {
      // this will have lat and long
      let element = resp.rows[0].elements[0];
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