/* jshint strict: true */
angular.module('CEDEK').controller('UserCtrl', ['$scope', '$routeParams', '$location', 'UserService', 'CatalogService', 'AuthService', 
    function($scope, $routeParams, $location, UserService, CatalogService, AuthService){
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
        UserService.update(userId, $scope.user, function(){
          $scope.$emit("userUpdated", userId);
        });
      };

      $scope.getUser = function(userId){
        $scope.user = UserService.get(userId);
      };

      $scope.checkNewPasswords = function(){
        if($scope.user.new_password === $scope.user.new_password_confirm){
          $scope.passwdForm.new_password_confirm.$invalid = false;
          $scope.passwdForm.$invalid = false;
        } else {
          $scope.passwdForm.new_password_confirm.$invalid = true;
          $scope.passwdForm.$invalid = true;
        }
      };

      $scope.updatePassword = function(){
        AuthService.changePassword($scope.getLoggedUser().id, $scope.user.current_password, $scope.user.new_password,
          function(){},
          function(){
          }
        );
      };

      $scope.checkPasswords = function(){
        if($scope.user.password === $scope.user.password_confirm){
          $scope.userForm.password_confirm.$invalid = false;
          $scope.userForm.$invalid = false;
        } else {
          $scope.userForm.password_confirm.$invalid = true;
          $scope.userForm.$invalid = true;
        }
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

