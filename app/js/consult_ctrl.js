/* jshint strict: true */
angular.module('CEDEK').controller('ConsultCtrl', ['$scope', '$routeParams', 'PeopleService', 'ConsultService', 'CatalogService',
    function($scope, $routeParams, PeopleService, ConsultService, CatalogService){

      $scope.person = null;
      $scope.todayConsult = null;
      $scope.lastConsults = null;

      $scope.create = function(personId){
        ConsultService.save($scope.todayConsult, personId, function(){
          var savedConsult = angular.copy($scope.todayConsult);
          $scope.lastConsults.unshift(savedConsult);
          ConsultService.cleanPacientConsult(personId);
          $scope.todayConsult.date = $scope.today();
        });
      };

      if($routeParams.personId){
        var personId = parseInt($routeParams.personId);
        $scope.person = PeopleService.getStudent(personId);
        $scope.leaders = CatalogService.leaders();
        $scope.todayConsult = ConsultService.getPacientConsult(personId);
        $scope.lastConsults = ConsultService.getLastConsults(personId);
        $scope.todayConsult.date = $scope.today();
        $scope.todayConsult.person_id = personId;
      }
    }
]);

