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

app.controller('PeopleCtrl', ['$scope', '$routeParams',
  function($scope, $routeParams){
    'use strict';

    $scope.courseId = "";
    $scope.studentId = "";
    $scope.selectedStudent = {"name": ""};

    $scope.students = [
      {"id": 1, "name": "Susana Alvarado", "enrollments": [{"id": 1, "name": "Curso II"}], "reserves": [{"id": 2, "name": "Curso IV"}], "previous": [{"id": 3, "name": "Curso I"}]}
    ];

    $scope.courses = [
      {"id": 1, "status": "Activo", "name": "Esperanto Avanzado"},
      {"id": 2, "status": "Abierto", "name": "Curso IV"}
    ];

    $scope.selectPerson = function(id){
      $scope.selectedStudent = $scope.students.filter(function(elem){ return elem.id == id; })[0];
    };

    if($routeParams.personId){

      $scope.selectPerson($routeParams.personId);
    }
  }]
);

app.controller('CourseCtrl', ['$scope', '$routeParams',
  function($scope, $routeParams){
    'use strict';

    $scope.selectedCourse = null;
    $scope.selectedStudent = null;

    $scope.courses = [
      {
      "id": 1,
      "name": "Homeopatia II",
      "begin": "4 de junio 2014",
      "end": "5 de enero 2015",
      "schedule": "Jueves 18:00",
      "students": [{"id": 1, "name": "Susana Alvarado"}, {"id": 2, "name": "Alfredo Alvarado"}, {"id": 3, "name": "Carlos Soria"}]
    }];

    $scope.selectStudent = function(id){
      $scope.selectedStudent = {"id": 1, "name": "Susana Alvarado", "enrollments": [{"id": 1, "name": "Curso II"}], "reserves": [{"id": 2, "name": "Curso IV"}], "previous": [{"id": 3, "name": "Curso I"}]};
    };

    $scope.selectCourse = function(id){
      $scope.selectedCourse = $scope.courses.filter(function(elem){ return elem.id == id; })[0];
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

app.directive('navigation', function(){
  return {
    replace: true,
    templateUrl: 'partials/navigation.html'
  };
});

app.directive('editable', function(){
  return {
    link: function(scope, element, attrs) {
      $(element).click(function(evt){ alert("Editable!"); });
    }
  };
});