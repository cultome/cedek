/* jshint strict: true */

angular.module('CEDEK', ['ngRoute']).
config(['$routeProvider', function($routeProvider) {
  'use strict';
  $routeProvider.when('/personas/agregar', {templateUrl: 'partials/persona/agregar.html', controller: 'PeopleCtrl'});
  $routeProvider.when('/personas/listar', {templateUrl: 'partials/persona/listar.html', controller: 'PeopleCtrl'});

  $routeProvider.when('/cursos/listar', {templateUrl: 'partials/curso/listar.html', controller: 'CourseCtrl'});
  $routeProvider.when('/cursos/agregar', {templateUrl: 'partials/curso/agregar.html', controller: 'CourseCtrl'});
  $routeProvider.when('/curso/activo/:courseId', {templateUrl: 'partials/curso/activo.html', controller: 'CourseCtrl'});

  $routeProvider.when('/dashboard', {templateUrl: 'partials/dashboard.html', controller: 'DashboardCtrl'});
  $routeProvider.otherwise({redirectTo: '/dashboard'});
}]);

var app = angular.module('CEDEK');

app.controller('PeopleCtrl', ['$scope',
  function($scope){
    'use strict';
    return {};
  }]
);

app.controller('CourseCtrl', ['$scope',
  function($scope){
    'use strict';
    return {};
  }]
);

app.controller('DashboardCtrl', ['$scope',
  function($scope){
    'use strict';
    return {};
  }]
);

app.directive('navigation', function(){
  return {
    replace: true,
    templateUrl: 'partials/navigation.html'
  };
});