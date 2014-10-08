/* jshint strict: true */
angular.module('CEDEK').controller('AdminCtrl', ['$scope', '$routeParams', '$sce', 'AdminService',
    function($scope, $routeParams, $sce, AdminService){
      'use strict';

      $scope.initEventList = function(){
        $scope.events = AdminService.getEvents();
      };

      $scope.sanitize = function(value){
        return $sce.trustAsHtml(value);
      };
    }
]);

angular.module('CEDEK').filter('dateFormat', function($filter){
  return function(input){
    if(input == null){ return ""; } 
    var _date = $filter('date')(new Date(input), "EEE dd MMM yyyy, HH:mm 'hrs'");
    return _date;
  };
});
