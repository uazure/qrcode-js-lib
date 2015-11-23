var app = angular.module('app', []);

app.controller('demoController', ['$scope', function($scope) {
    $scope.model = ''
    // instantiate QRCode library. Specify canvasElement (required), string to encode and pixel scale
    var qr = new QRCodeLib(document.getElementById('canvas'), '', 8);
    // on input change update qr code with new value
    $scope.$watch('model', function(newval) {
        qr.encode(newval);
    })
}]);
