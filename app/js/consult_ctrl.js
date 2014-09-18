/* jshint strict: true */
angular.module('CEDEK').controller('ConsultCtrl', ['$scope', '$routeParams', 'PeopleService',
  function($scope, $routeParams, PeopleService){

    $scope.todayConsult = {
      date: "2014-08-23",
      options: ["bl", "rj", "vr", "rs", "am"],
      reason: "No tengo nada que hacer",
      diagnostic: "Esa aburrido",
      treatment: "Pongase a trabajar"
    };

    $scope.lastConsults = [
    {
      date: "2014-08-23",
      options: ["bl", "rj", "vr", "rs", "am"],
      reason: "Me siento bien",
      diagnostic: "Estas muy loco",
      treatment: "Beber alcohol hasta olvidar"
    },
    {
      date: "2014-06-03",
      options: ["bl", "rj", "vr", "rs", "am"],
      reason: "Me siento mal",
      diagnostic: "Estas muy feo",
      treatment: "No verse al espejo en 20 dias"
    },
      {
        date: "2013-12-14",
        options: ["bl", "rj", "vr", "rs", "am"],
        reason: "Estoy muy viejo",
        diagnostic: "Tiene 69 aos",
        treatment: "Esperar la muerte"
      }
    ];

    $scope.create = function(consult){
      console.log(consult);
    };

    if($routeParams.personId){
      var personId = parseInt($routeParams.personId);
      $scope.person = PeopleService.getStudent(personId);
    }
  }
]);

