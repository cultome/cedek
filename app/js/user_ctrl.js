/* jshint strict: true */
angular.module('CEDEK').controller('UserCtrl', ['$scope', '$routeParams', '$location', 'UserService', 'CatalogService',
    function($scope, $routeParams, $location, UserService, CatalogService){
      'use strict';

      $scope.userTypes = CatalogService.userTypes();

      $scope.isCreatingUser = function(){
        return $location.path().match(/editar/) === null;
      };

      $scope.create = function(user){
        UserService.create(user, function(usr){
          $location.path("usuario/editar/" + usr.id);
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
        $scope.getUser(parseInt($routeParams.userId));
      } else {
        $scope.user = {
          "username": "",
          "name": "",
          "password": "",
          "password_confirm": "",
          "user_type_id": 2
        };
      }

    }
  ]
);

