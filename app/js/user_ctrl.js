/* jshint strict: true */
angular.module('CEDEK').controller('UserCtrl', ['$scope',
    function($scope){
      'use strict';

      $scope.isCreatingUser = function(){
        return true;
      };
    }
  ]
);

