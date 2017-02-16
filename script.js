// declare a module
var matrixKey = 'AIzaSyAocy0wxZ_HEmrp2C6iRDsjJzaUSp8MqHU';
var carInfoApiKey = 'j2mjhrhftx2k5kpvjmycctkf';
var gMapsKey = 'AIzaSyB27bkDRtChsWGdiCa1uPPSMqX0z1S0c2E';
var gasPriceAPI = 'https://wcypeu4s4j.execute-api.us-west-2.amazonaws.com/prod/lambda_handler';
var KMPL_MULTIPLIER = 0.4251;
var app = angular.module('app', ['google.places', 'angular.google.distance']);


// configure the module.
app.controller('mainController', ['$scope', '$http', 'GoogleDistanceAPI', '$q', '$window', '$filter', function($scope, $http, DistanceAPI, $q, $window, $filter) {
  // set google maps to only work with canada.
  $scope.reset = function() {
    $scope.firstPageError = false;
    $scope.secondPageError = false;
    $scope.showCarForm = false;
    $scope.showTransitForm = false;
    $scope.showResults = false;
    $scope.isOnLanding = true;
    $scope.isLoading = false;
    $scope.carFound = false;
    $scope.winner = undefined;
  }
  $scope.reset();
  $scope.car = {
    make: null,
    year: null,
    model: null
  }
  $scope.showForms = () => {
    $scope.isOnLanding = false;
    $scope.showCarForm = true;
  };
  $scope.parkingCost = 0;
  $scope.transitCost = 0;
  $scope.autocompleteOptions = {
    componentRestrictions: { country: 'ca' }
  };

  $scope.submit = () => {

    var carModel = document.getElementById('car-models').value;

    $scope.firstPageError = false;
    $scope.isLoading = true;
    $scope.showCarForm = false;
    $scope.showTransitForm = true;
    var distanceArgs = {
      origins: [$scope.origin['formatted_address']],
      destinations: [$scope.destination['formatted_address']]
    };
    var distanceReq = DistanceAPI.getDistanceMatrix(distanceArgs);
    var carInfoReq = $http.get(`https://api.edmunds.com/api/vehicle/v2/${$scope.car.make}/${carModel}/${$scope.car.year}/styles?api_key=${carInfoApiKey}&view=full`);
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

        var firstCar = values[1].data.styles[0];
        if (!firstCar) {
          $scope.carFound = false;
          $scope.isLoading = false;
          console.log('couldnt find car');
          return;
        }
        $scope.carFound = true;

        var mpg = (parseFloat(firstCar.MPG.city) + parseFloat(firstCar.MPG.highway)) / 2;
        $scope.mpg = mpg;
        console.log(values[2])
        this.kmpl = parseFloat(mpg) * KMPL_MULTIPLIER;
        $scope.gasPrice = values[2].data.body;
        this.centsPerKm = parseFloat($scope.gasPrice) / parseFloat(this.kmpl);
        this.centsPerTrip = this.centsPerKm * parseFloat($scope.distance);
        this.dollarsPerTripOneWay = this.centsPerTrip / 100;
        $scope.dollarsPerReturnTrip = this.dollarsPerTripOneWay * 2 + parseFloat($scope.parkingCost);
        $scope.isLoading = false;
      })
  };
  $scope.enterTransitInfo = () => {
    $scope.showTransitForm = false;
    // driving is cheaper
    function complete() {
      var dollarsPerReturnTrip = parseFloat($scope.dollarsPerReturnTrip);
      var transitCost = parseFloat($scope.transitCost);
      console.log('compare', dollarsPerReturnTrip, transitCost)
      if (dollarsPerReturnTrip < transitCost) {
        $scope.winner = 'car'
        $scope.suggestion = 'Driving your car will save you ' + $filter('currency')(transitCost - dollarsPerReturnTrip, '$');
        //commuting is cheaper
      } else if (dollarsPerReturnTrip > transitCost) {
        $scope.winner = 'bus'
        $scope.suggestion = 'Taking the transit will save you ' + $filter('currency')(dollarsPerReturnTrip - transitCost, '$');
      // they the same
    } else {
        $scope.winner = 'equal';
        $scope.suggestion = 'The cost is the same, do what your heart desires.'
      }
      $scope.showResults = true;
      $scope.showTransitForm = false;
    };
    $scope.$watch('isLoading', newVal => {
      if (!newVal) {
        complete();
      }
    })
  };
}]);

app.directive('carQuery', [function() {
  return {
    restrict: 'A',
    link: function() {
      var carquery = new CarQuery();
      carquery.init();
      carquery.initYearMakeModelTrim('car-years', 'car-makes', 'car-models');
    }
  }
}])
