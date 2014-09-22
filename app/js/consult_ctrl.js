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
          $scope.todayConsult = ConsultService.cleanPacientConsult(personId);
          $scope.todayConsult.consult_date = $scope.today();
        });
      };

      $scope.loadAll = function(){
        ConsultService.getAllConsults(personId, function(consults){
          $scope.lastConsults = consults;
          $scope.showingAll = true;
        });
      };

      if($routeParams.personId){
        var personId = parseInt($routeParams.personId);
        $scope.person = PeopleService.getStudent(personId);
        $scope.leaders = CatalogService.leaders();
        $scope.todayConsult = ConsultService.getPacientConsult(personId);
        $scope.lastConsults = ConsultService.getLastConsults(personId);
        $scope.todayConsult.consult_date = $scope.today();
        $scope.todayConsult.person_id = personId;
      }
    }
]);

