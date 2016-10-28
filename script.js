// declare a module
const matrixKey = 'AIzaSyAocy0wxZ_HEmrp2C6iRDsjJzaUSp8MqHU'
var app = angular.module('app', ['google.places', 'angular.google.distance']);

// configure the module.
// in this example we will create a greeting filter
app.controller('mainController', ['$scope', '$http', 'GoogleDistanceAPI', ($scope, $http, DistanceAPI) => {
  $scope.autocompleteOptions = {
    componentRestrictions: { country: 'ca' }
  };
  $scope.getDistance = () => {
    var distanceArgs = {
      origins: [$scope.origin['formatted_address']],
      destinations: [$scope.destination['formatted_address']]
    };
    DistanceAPI.getDistanceMatrix(distanceArgs)
    .then(resp => {
      let element = resp.rows[0].elements[0];
      $scope.duration = element.duration.text;
      $scope.distance = element.distance.text;


    })
  };
}]);