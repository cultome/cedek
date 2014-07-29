/* jshint strict: true */

angular.module('CEDEK', ['ngRoute']).
config(['$routeProvider', function($routeProvider) {
  'use strict';
  $routeProvider.when('/personas/agregar', {templateUrl: 'partials/persona/agregar.html', controller: 'PeopleCtrl'});
  $routeProvider.when('/personas/listar', {templateUrl: 'partials/persona/listar.html', controller: 'PeopleCtrl'});
  $routeProvider.when('/persona/editar/:personId', {templateUrl: 'partials/persona/agregar.html', controller: 'PeopleCtrl'});

  $routeProvider.when('/cursos/listar', {templateUrl: 'partials/curso/listar.html', controller: 'CourseCtrl'});
  $routeProvider.when('/cursos/agregar', {templateUrl: 'partials/curso/agregar.html', controller: 'CourseCtrl'});
  $routeProvider.when('/curso/:courseId', {templateUrl: 'partials/curso/detalles.html', controller: 'CourseCtrl'});
  $routeProvider.when('/curso/editar/:courseId', {templateUrl: 'partials/curso/agregar.html', controller: 'CourseCtrl'});

  $routeProvider.when('/dashboard', {templateUrl: 'partials/dashboard.html', controller: 'DashboardCtrl'});
  $routeProvider.otherwise({redirectTo: '/dashboard'});
}]);

var app = angular.module('CEDEK');


/*
 *   Controller
 */
app.controller('PeopleCtrl', ['$scope', '$routeParams', 'PeopleService', 'CourseService', 'CatalogService',
  function($scope, $routeParams, PeopleService, CourseService, CatalogService){
    'use strict';

    $scope.courseId = "";
    $scope.studentId = "";
    $scope.selectedStudent = {
      "name": "",
      "hasScholarship": false,
      "scholarshipPercent": 0,
      "phones": [{
        "number": "",
        "type": 1
      }]
    };
    $scope.phoneTypes = CatalogService.phoneTypes();
    $scope.students = PeopleService.getStudents();
    $scope.courses = CourseService.getCurrentCourses();

    $scope.getPhoneTypeName = function(id){
      return $scope.phoneTypes.filter(function(elem){ return elem.id === id; })[0].name;
    };

    $scope.selectPerson = function(id){
      $scope.selectedStudent = $scope.students.filter(function(elem){ return elem.id == id; })[0];
    };

    $scope.addAnotherPhone = function(){
      $scope.selectedStudent.phones.unshift({
        "number": "",
        "type": 1
      });
    };

    if($routeParams.personId){

      $scope.selectPerson($routeParams.personId);
    }
  }]
);

app.controller('CourseCtrl', ['$scope', '$routeParams', 'PeopleService', 'CourseService',
  function($scope, $routeParams, PeopleService, CourseService){
    'use strict';

    $scope.selectedCourse = null;
    $scope.selectedStudent = null;

    $scope.courses = CourseService.getCourses();

    $scope.selectStudent = function(id){
      $scope.selectedStudent = PeopleService.getStudent(id);
    };

    $scope.selectCourse = function(id){
      $scope.selectedCourse = CourseService.getCourse(id)
    };

    if($routeParams.courseId){
      $scope.selectCourse($routeParams.courseId);
    }
  }]
);

app.controller('DashboardCtrl', ['$scope',
  function($scope){
    'use strict';

    $scope.todayCourses = [
      {"id": 1, "scheduleTime": "13:00", "name": "Esperanto Basico"}
    ];

    $scope.comingCourses = [
      {"id": 2, "name": "Curso I", "beginDate": "20 junio 2014"}
    ];
  }]
);

/*
 *   Directive
 */

app.directive('navigation', function(){
  return {
    replace: true,
    templateUrl: 'partials/navigation.html'
  };
});

/*
 *   Factory
 */
app.factory('PeopleService', [function(){
  return {
    getStudents: function(){
      return [
        {"id": 1, "name": "Susana Alvarado", "enrollments": [{"id": 1, "name": "Curso II"}], "reserves": [{"id": 2, "name": "Curso IV"}], "previous": [{"id": 3, "name": "Curso I"}]},
        {"id": 2, "name": "Noel Soria", "enrollments": [{"id": 1, "name": "Curso I"}]}
      ];
    },

    getStudent: function(id){
      return this.getStudents().filter(function(elem){ return elem.id === id; });
    },
  };
}]);

app.factory('CatalogService', [function(){
  return {
    phoneTypes: function(){
      return [
        {"id": 1, "name": "Casa"},
        {"id": 2, "name": "Movil"},
        {"id": 3, "name": "Oficina"}
      ];
    }
  };
}]);

app.factory('CourseService', [function(){
  return {
    getCourse: function(id){
      return this.getCourses().filter(function(elem){ return elem.id === id; })[0];
    },
    getCourses: function(){
      return [
        {"id": 1, "name": "Homeopatia II", "begin": "4 de junio 2014", "end": "5 de enero 2015", "schedule": "Jueves 18:00", "students": [{"id": 1, "name": "Susana Alvarado"}, {"id": 2, "name": "Alfredo Alvarado"}]},
        {"id": 2, "name": "Biomagnetismo", "begin": "23 de octubre 2014", "end": "5 de enero 2015", "schedule": "Jueves 18:00", "students": [{"id": 1, "name": "Susana Alvarado"}, {"id": 3, "name": "Carlos Soria"}]},
        {"id": 3, "name": "Curso I", "begin": "17 de abril 2014", "end": "5 de enero 2015", "schedule": "Jueves 18:00", "students": [{"id": 2, "name": "Alfredo Alvarado"}, {"id": 3, "name": "Carlos Soria"}]},
        {"id": 4, "name": "Curso II", "begin": "6 de enero 2014", "end": "5 de enero 2015", "schedule": "Jueves 18:00", "students": [{"id": 3, "name": "Carlos Soria"}]},
        {"id": 5, "name": "Curso III", "begin": "20 de marzo 2014", "end": "5 de enero 2015", "schedule": "Jueves 18:00", "students": [{"id": 2, "name": "Alfredo Alvarado"}]},
        {"id": 6, "name": "Curso IV", "begin": "30 de septiembre 2014", "end": "5 de enero 2015", "schedule": "Jueves 18:00", "students": [{"id": 1, "name": "Susana Alvarado"}]}
      ];
    },

    getCurrentCourses: function(){
      return [
        {"id": 1, "status": "Activo", "name": "Esperanto Avanzado"},
        {"id": 2, "status": "Abierto", "name": "Curso IV"}
      ];
    },
  };
}]);