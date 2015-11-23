var app = angular.module('app', []);

app.controller('demoController', ['$scope', function($scope) {
    $scope.model = ''

    var ctx = document.getElementById('canvas').getContext('2d');
    var qr = new QRCode(document.getElementById('canvas'), '', 8);
    $scope.$watch('model', function(newval) {
        console.log('newval', newval);
        qr.encode(newval);
    })
}]);
