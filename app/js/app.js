/* jshint strict: true */

angular.module('CEDEK', ['ngRoute']).
config(['$routeProvider', function($routeProvider) {
  'use strict';
  $routeProvider.when('/personas/agregar', {templateUrl: 'pages/persona/agregar.html', controller: 'PeopleCtrl'});
  $routeProvider.when('/personas/listar', {templateUrl: 'pages/persona/listar.html', controller: 'PeopleCtrl'});
  $routeProvider.when('/persona/editar/:personId', {templateUrl: 'pages/persona/agregar.html', controller: 'PeopleCtrl'});

  $routeProvider.when('/cursos/listar', {templateUrl: 'pages/curso/listar.html', controller: 'CourseCtrl'});
  $routeProvider.when('/cursos/agregar', {templateUrl: 'pages/curso/agregar.html', controller: 'CourseCtrl'});
  $routeProvider.when('/curso/:courseId', {templateUrl: 'pages/curso/detalles.html', controller: 'CourseCtrl'});
  $routeProvider.when('/curso/editar/:courseId', {templateUrl: 'pages/curso/agregar.html', controller: 'CourseCtrl'});

  $routeProvider.when('/dashboard', {templateUrl: 'pages/dashboard.html', controller: 'DashboardCtrl'});
  $routeProvider.otherwise({redirectTo: '/dashboard'});
}]);

var app = angular.module('CEDEK');

/*
 *   Controller
 */
app.controller('RootCtrl', [function(){
  $scope.name = "Susana"
}]);



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
      }],
      "debts": null
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

    $scope.hasAcademicHistory = function(){
      return $scope.selectedStudent.enrollments || $scope.selectedStudent.reserves || $scope.selectedStudent.previous;
    };

    $scope.addAnotherPhone = function(){
      $scope.selectedStudent.phones.unshift({
        "number": "",
        "type": 1
      });
    };

    /*
     * Repetidos
     */

    $scope.toggleLatePaymentOptions = function(studentId){
      console.log(studentId);
      var section = $("#latePaymentOption" + studentId);
      if(section.css("display") === "none"){
        section.css("display", "");
      } else {
        section.css("display", "none");
      }
    };
    /*
     * /Repetidos
     */

    if($routeParams.personId){
      $scope.selectPerson(parseInt($routeParams.personId));
    }
  }]
);

app.controller('CourseCtrl', ['$scope', '$routeParams', 'PeopleService', 'CourseService',
  function($scope, $routeParams, PeopleService, CourseService){
    'use strict';

    $scope.showAttendance = false;
    $scope.students = null;
    $scope.selectedCourse = null;
    $scope.selectedStudent = null;
    $scope.studentsWithScholarship = null;
    $scope.studentsWithPendingPayments = null;
    $scope.courses = CourseService.getCourses();

    $scope.selectStudent = function(id){
      $scope.selectedStudent = PeopleService.getStudent(id);
    };

    $scope.toggleViewAttendance = function(id){
      if($scope.selectedCourse && $scope.showAttendance && $scope.selectedCourse.id === id){
        $scope.showAttendance = false;
      } else {
        $scope.showAttendance = true;
        $scope.selectCourse(id);
      }
    };

    $scope.toggleViewStudents = function(id){
      if($scope.selectedCourse && $scope.students && $scope.selectedCourse.id === id){
        $scope.students = null;
      } else {
        $scope.selectCourse(id);
        $scope.students = $scope.selectedCourse.students;
      }
    };

    // TODO check deprecated
    $scope.selectCourse = function(id){
      $scope.selectedCourse = CourseService.getCourse(id)
    };

    $scope.changeToPartialPayment = function(studentId){
      $scope.selectedCourse.students.filter(function(elem){ return elem.id === studentId; })[0].paymentType = 2;
      $("#payment" + studentId).attr("type", "number");
    };

    $scope.changeToLaterPayment = function(studentId){
      $scope.selectedCourse.students.filter(function(elem){ return elem.id === studentId; })[0].paymentType = 3;
      $("#payment" + studentId).attr("type", "date");
    };

    $scope.togglePaymentOptions = function(studentId){
      var section = $("#paymentOption" + studentId);
      if(section.css("display") === "none"){
        section.css("display", "");
      } else {
        section.css("display", "none");
      }
    };

    $scope.toggleLatePaymentOptions = function(studentId){
      var section = $("#latePaymentOption" + studentId);
      if(section.css("display") === "none"){
        section.css("display", "");
      } else {
        section.css("display", "none");
      }
    };

    $scope.getStudentsWithScholarship = function(courseId){
      $scope.studentsWithScholarship = PeopleService.getStudentsWithScholarship(courseId);
      return $scope.studentsWithScholarship;
    };

    $scope.getStudentsWithPendingPayments = function(courseId){
      $scope.studentsWithPendingPayments = PeopleService.getStudentsWithPendingPayments(courseId);
      return $scope.studentsWithPendingPayments;
    };

    if($routeParams.courseId){
      var courseId = parseInt($routeParams.courseId);
      $scope.selectCourse(courseId);
      $scope.getStudentsWithScholarship(courseId);
      $scope.getStudentsWithPendingPayments(courseId);
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
    templateUrl: 'pages/navigation.html'
  };
});

app.directive('studentList', function(){
  return {
    replace: true,
    scope: {
      students: '=model',
      showAttendance: '@showAttendance'
    },
    templateUrl: 'pages/partials/listaEstudiantes.html'
  };
});

app.directive('courseView', function(){
  return {
    replace: true,
    templateUrl: 'pages/partials/vistaCurso.html'
  };
});

app.directive('detailedCourseView', function(){
  return {
    replace: true,
    templateUrl: 'pages/partials/vistaDetalladaCurso.html'
  };
});

app.directive('studentListFullOpc', function(){
  return {
    replace: true,
    templateUrl: 'pages/partials/listaEstudiantesOpcionesCompletas.html'
  };
});

app.directive('studentView', function(){
  return {
    replace: true,
    transclude: true,
    scope: {
      student: '=model',
      canCollapse: '@canCollapse',
      showAttendance: '@showAttendance',
      id: '='
    },
    templateUrl: 'pages/partials/vistaEstudiante.html'
  };
});

app.directive('subscribeCourse', function(){
  return {
    replace: true,
    templateUrl: 'pages/partials/inscribeReservaCurso.html'
  };
});

function createPaymentChange(paymentType, debt, element, styleId, type){
  return function(){
    debt.paymentType = paymentType;
    $(element).find("#" + styleId + debt.id).attr("type", type);
  };
};

app.directive('paymentOptionsCompact', function(){
  return {
    replace: true,
    scope: {
      debt: '=model'
    },
    link: function(scope, element, attrs){
      scope.changeToLaterPayment = createPaymentChange(3, scope.debt, element, "paymentSmall", "date");
      scope.changeToPartialPayment = createPaymentChange(2, scope.debt, element, "paymentSmall", "number");
    },
    templateUrl: 'pages/partials/opcionesPagoCompacto.html'
  };
});

app.directive('paymentOptions', function(){
  return {
    replace: true,
    scope: {
      debt: '=model'
    },
    templateUrl: 'pages/partials/opcionesPago.html',
    link: function(scope, element, attrs){
      scope.changeToLaterPayment = createPaymentChange(3, scope.debt, element, "payment", "date");
      scope.changeToPartialPayment = createPaymentChange(2, scope.debt, element, "payment", "number");
    }
  };
});

app.directive('searchAttendance', ['CourseService', function(CourseService){
  return {
    replace: true,
    templateUrl: 'pages/partials/buscarAsistencia.html',
    scope: {
      courseId: '&courseId',
    },
    link: function(scope, element, attrs){
      scope.attendanceDate = "";
      scope.attendance = null;

      scope.getAttendance = function(){
        console.log(scope.courseId(), scope.attendanceDate);
        scope.attendance = CourseService.getAttendance(scope.courseId(), scope.attendanceDate);
      };
    }
  };
}]);
/*
 *   Factory
 */
app.factory('PeopleService', [function(){
  return {
    getStudents: function(){
      return [
        {
"id": 1,
"name": "Susana Alvarado",
          "hasScholarship": true, "scholarshipPercentage": 45,
          "enrollments": [{"id": 1, "name": "Curso II"}],
          "reserves": [{"id": 2, "name": "Curso IV"}],
          "previous": [{"id": 3, "name": "Curso I"}],
          "debts": [{"id": 1, "course": {"id": 2, "name": "Biomagnetismo"}, "amount": 145, "dateLimit": "10 de octubre 2014"},{"id": 2, "course": {"id": 1, "name": "Homeopatia"}, "amount": 15}],
// para pagos pendientes
"debt": 145,
"debtLimit": "5 de enero 2015",
// /para pagos pendientes
          "scholarships": [{"id": 1, "course": {"id": 2, "name": "Biomagnetismo"}, "percentage": 45}]
        },
        {
          "id": 2,
          "name": "Noel Soria",
          "hasScholarship": false,
          "scholarshipPercentage": 0,
// para pagos pendientes
"debt": 50,
"debtLimit": "5 de enero 2015",
// /para pagos pendientes
          "enrollments": [{"id": 1, "name": "Curso I"}],
          "debts": [{"id": 2, "course": {"id": 2, "name": "Biomagnetismo"}, "amount": 15, "dateLimit": "10 de octubre 2014"}],
          "scholarships": [{"id": 1, "course": {"id": 1, "name": "Homeopatia"}, "percentage": 78}]
        }
      ];
    },

    getStudent: function(id){
      return this.getStudents().filter(function(elem){ return elem.id === id; })[0];
    },

    getStudentsWithPendingPayments: function(courseId){
      return this.getStudents().filter(function(elem){
        var debts = elem.debts.filter(function(el){ return el.course.id === courseId; });
        return debts != null && debts.length > 0;
      });
    },

    getStudentsWithScholarship: function(courseId){
      return this.getStudents().filter(function(elem){
        var scholarships = elem.scholarships.filter(function(el){ return el.course.id === courseId; });
        return scholarships != null && scholarships.length > 0;
      });
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
        {"id": 1, "code": "HOM-JU", "name": "Homeopatia II", "begin": "4 de junio 2014", "end": "5 de enero 2015", "schedule": "Jueves 18:00", "students": [{"id": 1, "name": "Susana Alvarado", "attend": true}, {"id": 2, "name": "Alfredo Alvarado"}]},
        {"id": 2, "code": "BIO-JU", "name": "Biomagnetismo", "begin": "23 de octubre 2014", "end": "5 de enero 2015", "schedule": "Jueves 18:00", "students": [{"id": 1, "name": "Susana Alvarado"}, {"id": 3, "name": "Carlos Soria"}]},
        {"id": 3, "code": "CUR-I", "name": "Curso I", "begin": "17 de abril 2014", "end": "5 de enero 2015", "schedule": "Jueves 18:00", "students": [{"id": 2, "name": "Alfredo Alvarado"}, {"id": 3, "name": "Carlos Soria"}]},
        {"id": 4, "code": "CUR-II", "name": "Curso II", "begin": "6 de enero 2014", "end": "5 de enero 2015", "schedule": "Jueves 18:00", "students": [{"id": 3, "name": "Carlos Soria"}, {"id": 4, "name": "Noel Soria"}]},
        {"id": 5, "code": "CUR-III", "name": "Curso III", "begin": "20 de marzo 2014", "end": "5 de enero 2015", "schedule": "Jueves 18:00", "students": [{"id": 2, "name": "Alfredo Alvarado"}]},
        {"id": 6, "code": "CUR-IV", "name": "Curso IV", "begin": "30 de septiembre 2014", "end": "5 de enero 2015", "schedule": "Jueves 18:00", "students": [{"id": 1, "name": "Susana Alvarado"}]}
      ];
    },

    getCurrentCourses: function(){
      return [
        {"id": 1, "status": "Activo", "name": "Esperanto Avanzado"},
        {"id": 2, "status": "Abierto", "name": "Curso IV"}
      ];
    },

    getAttendance: function(courseId, date){
      return [
        {"id": 1, "name": "Susana Alvarado", "attend": true},
        {"id": 2, "name": "Carlos Soria", "attend": false},
        {"id": 2, "name": "Paloma Alvarado", "attend": true}
      ];
    },
  };
}]);