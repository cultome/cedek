/* jshint strict: true */
angular.module('CEDEK').controller('AdminCtrl', ['$scope', '$routeParams', '$sce', '$filter', 'AdminService', 'PagerService', 'PeopleService', 'ConsultService', 'CatalogService',
    function($scope, $routeParams, $sce, $filter, AdminService, PagerService, PeopleService, ConsultService, CatalogService){
      'use strict';

      $scope.panels = {
        "consults": {
          "person": null,
          "todayConsult": null,
          "lastConsults": null,
        },
        "events": {
          "list": [],
          "since": null,
          "to": null,
          "currentPage": 1,
          "maxPage": 50,
          "maxEvents": 0,
          "pagerSlots": 5,
          "totalPages": function(){
            return Math.ceil(this.maxEvents / this.maxPage);
          },
          "hasNext": function(){
            return this.currentPage < this.totalPages();
          },
          "hasPrev": function(){
            return this.currentPage > 1;
          },
          "getPages": function(){
            var t = this.totalPages();
            var ps = [];

            if(this.currentPage < (this.pagerSlots / 2)){
              for(var i = 1; i <= this.pagerSlots; i++){
                if(i <= this.totalPages()){
                  ps.push(i);
                }
              }

            } else if(this.currentPage + (this.pagerSlots / 2) >= this.totalPages()){
              for(var i = this.totalPages() - this.pagerSlots; i <= this.totalPages(); i++){
                if(i > 0){
                  ps.push(i);
                }
              }

            } else {
              for(var i = 1; i <= this.pagerSlots; i++){
                var nbr = this.currentPage - Math.ceil(this.pagerSlots / 2) + i;
                ps.push(nbr);
              }
            }

            return ps;
          },
        }
      };

      $scope.initConsult = function(){
        $scope.people = PeopleService.listStudents();
        $scope.leaders = CatalogService.leaders();
      };

      $scope.initEventList = function(){
        $scope.getEvents();
      };

      $scope.createConsult = function(personId){
        ConsultService.save($scope.panels.consults.todayConsult, personId, function(){
          var savedConsult = angular.copy($scope.panels.consults.todayConsult);
          savedConsult.opts = savedConsult.drops;
          $scope.panels.consults.lastConsults.unshift(savedConsult);
          ConsultService.cleanPacientConsult(personId);
          $scope.panels.consults.todayConsult = ConsultService.getCurrentConsult(personId, $scope.consultDate);
        });
      };

      $scope.loadPerson = function(){
        $scope.panels.consults.person = PeopleService.getStudent($scope.personId);
        $scope.panels.consults.lastConsults = ConsultService.getLastConsults($scope.personId);
        $scope.panels.consults.todayConsult = ConsultService.getCurrentConsult($scope.personId, $scope.consultDate);
      };

      $scope.getEvents = function(){
        PagerService.getEventsCount(function(req){
          $scope.panels.events.maxEvents = req.count;
        });

        $scope.panels.events.list = AdminService.getEvents($scope.panels.events.currentPage, $scope.panels.events.maxPage, function(events){
          $scope.panels.events.since = $filter("shortDateFormat")(events[events.length - 1].date);
          $scope.panels.events.to = $filter("shortDateFormat")(events[0].date);
        });
      };

      $scope.getPage = function(pageNbr){
        if(pageNbr > $scope.panels.events.totalPages() || pageNbr <= 0){
          console.log($scope.panels.events.totalPages());
          console.log(pageNbr);
          $scope.notify("Pagina invalida", "warning");
          return ;
        }
        // actualizamos el numero de pagina
        $scope.panels.events.currentPage = pageNbr;
        // vamos por los datos
        $scope.getEvents();
      };

      $scope.nextPage = function(){
        if($scope.panels.events.hasNext()){
          $scope.getPage($scope.panels.events.currentPage + 1);
        }
      };

      $scope.prevPage = function(){
        if($scope.panels.events.hasPrev()){
          $scope.getPage($scope.panels.events.currentPage - 1);
        }
      };

      $scope.sanitize = function(value){
        return $sce.trustAsHtml(value);
      };
    }
]);

angular.module('CEDEK').filter('shortDateFormat', function($filter){
  return function(input){
    if(input == null){ return ""; } 
    var _date = $filter('date')(new Date(input), "dd MMM yyyy, HH:mm");
    return _date;
  };
});

angular.module('CEDEK').filter('dateFormat', function($filter){
  return function(input){
    if(input == null){ return ""; } 
    var _date = $filter('date')(new Date(input), "EEE dd MMM yyyy, HH:mm 'hrs'");
    return _date;
  };
});
