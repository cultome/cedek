/* jshint strict: true */
angular.module('CEDEK').controller('ConsultCtrl', ['$scope', '$routeParams', 'PeopleService',
  function($scope, $routeParams, PeopleService){

    if($routeParams.personId){
      var personId = parseInt($routeParams.personId);
      $scope.person = PeopleService.getStudent(personId);
    }
  }
]);

