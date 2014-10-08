/* jshint strict: true */

angular.module('CEDEK', [
    'ngResource',
    'ngSanitize',
    'ngRoute'//,'templates'
]).
config(['$routeProvider', function($routeProvider) {
  'use strict';
  $routeProvider.when('/personas/agregar', {templateUrl: 'pages/persona/agregar.html', controller: 'PeopleCtrl', roles: ['Administrador']});
  $routeProvider.when('/personas/listar', {templateUrl: 'pages/persona/listar.html', controller: 'PeopleCtrl', roles: ['Administrador', 'Regular']});
  $routeProvider.when('/persona/editar/:personId', {templateUrl: 'pages/persona/agregar.html', controller: 'PeopleCtrl', roles: ['Administrador', 'Regular']});

  $routeProvider.when('/cursos/listar', {templateUrl: 'pages/curso/listar.html', controller: 'CourseCtrl', roles: ['Administrador', 'Regular']});
  $routeProvider.when('/cursos/agregar', {templateUrl: 'pages/curso/agregar.html', controller: 'CourseCtrl', roles: ['Administrador']});
  $routeProvider.when('/curso/:courseId', {templateUrl: 'pages/curso/detalles.html', controller: 'CourseCtrl', roles: ['Administrador', 'Regular']});
  $routeProvider.when('/curso/editar/:courseId', {templateUrl: 'pages/curso/agregar.html', controller: 'CourseCtrl', roles: ['Administrador']});

  $routeProvider.when('/usuarios/listar', {templateUrl: 'pages/usuario/listar.html', controller: 'UserCtrl', roles: ['Administrador']});
  $routeProvider.when('/usuarios/agregar', {templateUrl: 'pages/usuario/agregar.html', controller: 'UserCtrl', roles: ['Administrador']});
  $routeProvider.when('/usuario/editar/:userId', {templateUrl: 'pages/usuario/agregar.html', controller: 'UserCtrl', roles: ['Administrador', 'Regular']});

  $routeProvider.when('/admin/eventos', {templateUrl: 'pages/admin/eventos.html', controller: 'AdminCtrl', roles: ['Administrador']});
  $routeProvider.when('/admin/consultas', {templateUrl: 'pages/consulta/agregar.html', controller: 'AdminCtrl', roles: ['Administrador']});

  $routeProvider.when('/consulta/nueva/:personId', {templateUrl: 'pages/consulta/agregar.html', controller: 'UserCtrl', roles: ['Administrador', 'Regular']});

  $routeProvider.when('/login', {templateUrl: 'pages/login.html', roles: ['Administrador', 'Regular']});

  $routeProvider.when('/dashboard', {templateUrl: 'pages/dashboard.html', controller: 'DashboardCtrl', roles: ['Administrador', 'Regular']});
  $routeProvider.otherwise({redirectTo: '/dashboard'});
}]);







var app = angular.module('CEDEK');

/*
 *   Controller
 */
app.controller('RootCtrl', ['$scope', '$route', '$location', 'AuthService', 'UserService',
    function($scope, $route, $location, AuthService, UserService){
      "use strict";

      $scope.currentUser = null;
      $scope.redirectAfterLogin = null;
      $scope.login = {
        "username": "",
        "password": ""
      };

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

      $scope.login = function(){
        AuthService.login($scope.login.username, $scope.login.password, function(user){
          $scope.currentUser = user;
          $location.path($scope.redirectAfterLogin);
        }, function(response){
          $scope.notify(response.data, "error");
        });
      };

      $scope.notify = function(message, className){
        $.notify(message, {globalPosition: "top center", autoHideDelay: 2000, className: className});
      };

      $scope.getInputClass = function(input, base){
        var classes = [].concat(base);

        if($scope.isInputInvalid(input)){
          classes.push('has-feedback');
          classes.push('has-error');
        }
        return classes;
      };

      $scope.isInputInvalid = function(input){
        return input.$invalid && input.$dirty;
      };

      $scope.getLoggedUser = function(){
        return $scope.currentUser;
      };

      $scope.isLogged = function(){
        return $scope.currentUser !== null;
      };

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

      $scope.getDateLabel = function(dateStr, abbr){
        if(dateStr == null){
          return "";
        }
        var date = dateStr.split("-");
        var year = parseInt(date[0]);
        var month = parseInt(date[1]) - 1;
        var day = parseInt(date[2]);

        var monthName = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][month];

        if(abbr){
          return day + " " + monthName.substring(0,3) + " " + year;
        } else {
          return day + " de " + monthName + "  " + year;
        }
      };

      $scope.$on("userUpdated", function(evt, userId){
        $scope.currentUser = UserService.get(userId);
      });

      $scope.$on("$locationChangeStart", function(evt, next, current){
        var nextRoutePath = next.substring(next.indexOf("#") + 1);
        for(var r in $route.routes){
          var route = $route.routes[r];
          if(nextRoutePath.match(route.regexp) !== null && r !== "null"){
            if($scope.isLogged()){
              if(route && route.roles.indexOf($scope.getLoggedUser().user_type_name) < 0){
                $scope.notify("No tienes autorizacion para entrar ahi", "error");
                $location.path("/dashboard");
              }
            } else {
              if(next.match(/login$/) === null){
                var path = next.substring(next.indexOf("#") + 1);
                $scope.redirectAfterLogin = path;
              }
              $location.path("/login");
            }
          }
        }
      });

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
