/* jshint strict: true */

angular.module('CEDEK', [
    'ngResource',
    'ngRoute'//,'templates'
]).
config(['$routeProvider', function($routeProvider) {
  'use strict';
  $routeProvider.when('/personas/agregar', {templateUrl: 'pages/persona/agregar.html', controller: 'PeopleCtrl'});
  $routeProvider.when('/personas/listar', {templateUrl: 'pages/persona/listar.html', controller: 'PeopleCtrl'});
  $routeProvider.when('/persona/editar/:personId', {templateUrl: 'pages/persona/agregar.html', controller: 'PeopleCtrl'});

  $routeProvider.when('/cursos/listar', {templateUrl: 'pages/curso/listar.html', controller: 'CourseCtrl'});
  $routeProvider.when('/cursos/agregar', {templateUrl: 'pages/curso/agregar.html', controller: 'CourseCtrl'});
  $routeProvider.when('/curso/:courseId', {templateUrl: 'pages/curso/detalles.html', controller: 'CourseCtrl'});
  $routeProvider.when('/curso/editar/:courseId', {templateUrl: 'pages/curso/agregar.html', controller: 'CourseCtrl'});

  $routeProvider.when('/consulta/nueva/:personId', {templateUrl: 'pages/consulta/agregar.html', controller: 'ConsultCtrl'});

  $routeProvider.when('/dashboard', {templateUrl: 'pages/dashboard.html', controller: 'DashboardCtrl'});
  $routeProvider.otherwise({redirectTo: '/dashboard'});
}]);







var app = angular.module('CEDEK');

/*
 *   Controller
 */
app.controller('RootCtrl', ['$scope', '$route', function($scope, $route){
  "use strict";

  $scope.showFilter = true;
  $scope.alerts = {
    "confirmRemoveStudentFromCourse": {
      name: "_none_"
    },

    "confirmDeleteScholarship": {
      name: "_none_"
    },

    "confirmDebtClose": {
      amount: 0,
      name: "_none_"
    }
  };

  $scope.$on("$routeChangeSuccess", function(){
    // limpiamos el filtro
    $scope.name = "";
    var path = $route.current.originalPath;
    if(path !== undefined && (path.match("listar$") || path.match("^/curso/:courseId$")) ){
      $scope.showFilter = true;
    } else {
      $scope.showFilter = false;
    }
  });

  $scope.toggleLatePaymentOptions = function(studentId){
    var section = $("#latePaymentOption" + studentId);
    if(section.css("display") === "none"){
      section.css("display", "");
    } else {
      section.css("display", "none");
    }
  };

  $scope.getAge = function(birthday){
    if(birthday){
      return (new Date()).getFullYear() - parseInt(birthday.split("-")[0]);
    }
    return 0;
  };

  $scope.today = function(){
    var d = new Date();
    var month = (d.getMonth() + 1);
    var date = d.getDate();
    return d.getFullYear() + "-" + ( month < 10 ? "0" + month : month) + "-" +(  date < 10 ? "0" + date : date);
  };

  $scope.getDateLabel = function(dateStr){
    if(dateStr == null){
      return "";
    }
    var date = dateStr.split("-");
    var year = parseInt(date[0]);
    var month = parseInt(date[1]) - 1;
    var day = parseInt(date[2]);

    var monthName = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][month];

    return day + " de " + monthName + "  " + year;
  };
}]);







app.controller('DashboardCtrl', ['$scope', 'PeopleService', 'CourseService', function($scope, PeopleService, CourseService){
  'use strict';

  $scope.todayCourses = null;
  $scope.comingCourses = null;
  $scope.todayBirthdays = null;
  $scope.activeCourses = null;

  $scope.initDashboard = function(){
    $scope.comingCourses = CourseService.getComingCourses();
    $scope.activeCourses = CourseService.getActiveCourses();

    CourseService.getTodayCourses(function(courses){
      courses.forEach(function(course){
        course.scheduleTime = course.hour.substring(11, 16);
      });
      $scope.todayCourses = courses;
    });

    PeopleService.birthdaysToday(function(birthdays){
      birthdays.forEach(function(birthday){
        birthday.age = $scope.getAge(birthday.birthday);
      });
      $scope.todayBirthdays = birthdays;
    });
  };
}]);
