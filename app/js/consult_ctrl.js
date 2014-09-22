/* jshint strict: true */
angular.module('CEDEK').controller('ConsultCtrl', ['$scope', '$routeParams', 'PeopleService', 'ConsultService', 'CatalogService',
    function($scope, $routeParams, PeopleService, ConsultService, CatalogService){

      $scope.person = null;
      $scope.todayConsult = null;
      $scope.lastConsults = null;
      $scope.showingAll = false;

      $scope.create = function(personId){
        ConsultService.save($scope.todayConsult, personId, function(){
          var savedConsult = angular.copy($scope.todayConsult);
          savedConsult.opts = savedConsult.drops;
          $scope.lastConsults.unshift(savedConsult);
          ConsultService.cleanPacientConsult(personId);
          $scope.todayConsult = ConsultService.getCurrentConsult(personId, $scope.today());
        });
      };

      $scope.loadAll = function(){
        ConsultService.getAllConsults(personId, function(consults){
          $scope.lastConsults = consults;
          $scope.showingAll = true;
        });
      };

      $scope.isStudent = function(person){
        if(person.previous && person.reserves && person.enrollments){
          return (person.previous.length > 0 || person.reserves.length > 0 || person.enrollments.length > 0) ? "Si" : "No";
        }

        return "No";
      };

      if($routeParams.personId){
        var personId = parseInt($routeParams.personId);
        $scope.person = PeopleService.getStudent(personId);
        $scope.leaders = CatalogService.leaders();
        $scope.lastConsults = ConsultService.getLastConsults(personId);
        $scope.todayConsult = ConsultService.getCurrentConsult(personId, $scope.today());
      }
    }
]);

