var app = angular.module('app', []);

app.controller('demoController', ['$scope', function($scope) {
    $scope.model = ''

    var ctx = document.getElementById('canvas').getContext('2d');
    var qr = new QRCode('');
    $scope.$watch('model', function(newval) {
        console.log('newval', newval);
        qr.clear();
        qr.addSegment(newval);
        qr.draw(ctx);
    })
}]);
