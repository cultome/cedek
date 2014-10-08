/* jshint strict: true */
angular.module('CEDEK').controller('UserCtrl', ['$scope', '$routeParams', '$location', 'UserService', 'CatalogService', 'AuthService', 
    function($scope, $routeParams, $location, UserService, CatalogService, AuthService){
      'use strict';

      $scope.userTypes = CatalogService.userTypes();
      $scope.user = null;
      $scope.passwords = null;
      $scope.users = null;

      $scope.isCreatingUser = function(){
        return $location.path().match(/editar/) === null;
      };

      $scope.create = function(user){
        UserService.create(user, function(usr){
          $scope.notify("El usuario '" + user.name +  "' fue creado ", "success");
          $location.path("usuario/editar/" + usr.id);
        });
      };

      $scope.update = function(userId){
        UserService.update(userId, $scope.user, function(){
          $scope.$emit("userUpdated", userId);
          $scope.notify("Datos del usuario actualizados!", "success");
        }, function(response){
          $scope.notify(response.data, "error");
        });
      };

      $scope.getUser = function(userId){
        $scope.user = UserService.get(userId);
      };

      $scope.updatePassword = function(){
        AuthService.changePassword($scope.getLoggedUser().id, $scope.user.current_password, $scope.user.new_password, 
          function(){
            $scope.notify("Contrase&ntilde;a actualizada!", "success");
          },
          function(response){
            $scope.notify(response.data, "error");
          }
        );
      };

      $scope.checkPasswords = function(form, data){
        if(data.password === data.password_confirm){
          form.password_confirm.$invalid = false;
          form.$invalid = !form.$valid;
        } else {
          form.password_confirm.$invalid = true;
          form.$invalid = true;
        }
      };

      $scope.initUserList = function(){
        $scope.users = UserService.getUsers();
      };

      if($routeParams.userId){
        var requestedUserId = parseInt($routeParams.userId);
        if($scope.getLoggedUser().user_type_id === 1 || $scope.getLoggedUser().id === requestedUserId){
          $scope.getUser(requestedUserId);
        } else {
          // no esta autorizado
          $scope.notify("No estas autorizado para editar ese usuario", "error");
          $location.path("/dashboard");
        }
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

