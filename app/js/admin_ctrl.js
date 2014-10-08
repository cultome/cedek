/* jshint strict: true */
angular.module('CEDEK').controller('AdminCtrl', ['$scope', '$routeParams', '$sce', '$filter', 'AdminService', 'PagerService',
    function($scope, $routeParams, $sce, $filter, AdminService, PagerService){
      'use strict';

      $scope.panels = {
        "info": {
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
            return this.currentPage + Math.floor(this.pagerSlots / 2) < this.totalPages();
          },
          "hasPrev": function(){
            return this.currentPage > 1;
          },
          "getPages": function(){
            var t = this.totalPages();
            var ps = [];

            if(this.currentPage < (this.pagerSlots / 2)){
              console.log("=1=");
              for(var i = 1; i <= this.pagerSlots; i++){
                if(i <= this.totalPages()){
                  ps.push(i);
                }
              }

            } else if(this.currentPage + (this.pagerSlots / 2) >= this.totalPages()){
              console.log("=2=");
              for(var i = this.totalPages() - this.pagerSlots; i <= this.totalPages(); i++){
                if(i > 0){
                  ps.push(i);
                }
              }

            } else {
              console.log("=3=");
              for(var i = 1; i <= this.pagerSlots; i++){
                var nbr = this.currentPage - Math.ceil(this.pagerSlots / 2) + i;
                ps.push(nbr);
              }
            }

            return ps;
          },
        }
      };

      $scope.initEventList = function(){
        $scope.getEvents();
      };

      $scope.getEvents = function(){
        PagerService.getEventsCount(function(req){
          $scope.panels.info.maxEvents = req.count;
        });
        $scope.events = AdminService.getEvents($scope.panels.info.currentPage, $scope.panels.info.maxPage, function(events){
          $scope.panels.info.since = $filter("shortDateFormat")(events[events.length - 1].date);
          $scope.panels.info.to = $filter("shortDateFormat")(events[0].date);
        });
      };

      $scope.getPage = function(pageNbr){
        if(pageNbr > $scope.panels.info.totalPages() || pageNbr <= 0){
          console.log($scope.panels.info.totalPages());
          console.log(pageNbr);
          $scope.notify("Pagina invalida", "warning");
          return ;
        }
        // actualizamos el numero de pagina
        $scope.panels.info.currentPage = pageNbr;
        // vamos por los datos
        $scope.getEvents();
      };

      $scope.nextPage = function(){
        $scope.getPage($scope.panels.info.currentPage + 1);
      };

      $scope.prevPage = function(){
        $scope.getPage($scope.panels.info.currentPage - 1);
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
