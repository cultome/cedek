/* jshint strict: true */
angular.module('CEDEK').controller('UserCtrl', ['$scope', '$routeParams', 'UserService',
    function($scope, $routeParams, UserService){
      'use strict';

      $scope.isCreatingUser = function(){
        return true;
      };

      $scope.create = function(user){
        UserService.create(user, function(){
        });
      };

      $scope.update = function(userId){
        UserService.update(userId, user, function(){
        });
      };

      $scope.getUser = function(userId){
        $scope.user = UserService.get(userId);
      };

      if($routeParams.userId){
        getUser(parseInt($routeParams.userId));
      } else {
        $scope.user = {
          "username": "",
          "name": ""
        };
      }

    }
  ]
);

