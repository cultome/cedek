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

  $scope.$on("$routeChangeSuccess", function(){
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

  $scope.getDateLabel = function(dateStr){
    var date = dateStr.split("-");
    var year = parseInt(date[0]);
    var month = parseInt(date[1]);
    var day = parseInt(date[2]);

    var monthName = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][month];

    return day + " de " + monthName + "  " + year;
  };
}]);


app.controller('PeopleCtrl', ['$scope', '$routeParams', 'PeopleService', 'CourseService', 'CatalogService',
    function($scope, $routeParams, PeopleService, CourseService, CatalogService){
      'use strict';
      // list students
      $scope.students = null;
      $scope.courses = null;

      $scope.courseId = "";
      $scope.studentId = "";
      $scope.student = {
        "name": "",
        "has_scholarship": false,
        "scholarship_percentage": '',
        "lead_pray_group": false,
        "phones": [{
          "number": "",
          "type": 1
        }]
      };
      $scope.phoneTypes = CatalogService.phoneTypes();

      // deprecate
      $scope.create = function(){
        console.log($scope.studentForm);
        var success = PeopleService.createStudent($scope.student);
        console.log("Saved? ");
        console.log(success);
      };

      $scope.update = function(personId){
      };

      $scope.isCreatingPerson = function(){
        return $scope.student.scholarships == null;
      };

      $scope.getPhoneTypeName = function(id){
        if($scope.phoneTypes.length <= 1){
          return "";
        }
        return $scope.phoneTypes.filter(function(elem){ return elem.id === id; })[0].name;
      };

      $scope.hasAcademicHistory = function(){
        return $scope.student.enrollments || $scope.student.reserves || $scope.student.previous;
      };

      $scope.addAnotherPhone = function(){
        if(!$scope.student.phones[0].number.match(/^[\s]*$/)){
          $scope.student.phones.unshift({
            "number": "",
            "type": 1
          });
        }
      };

      $scope.initStudentList = function(){
        $scope.students = PeopleService.listStudents();
        $scope.courses = CourseService.getOpenCourses();
      };

      if($routeParams.personId){
        $scope.student = PeopleService.getStudent(parseInt($routeParams.personId));
      }
    }]
);

app.controller('CourseCtrl', ['$scope', '$routeParams', 'PeopleService', 'CourseService',
    function($scope, $routeParams, PeopleService, CourseService){
      'use strict';

      $scope.students = null;
      $scope.course = null;
      $scope.sessions = null;
      $scope.selectedStudent = null;
      $scope.studentsWithScholarship = null;
      $scope.studentsWithPendingPayments = null;
      $scope.courses = null;
      $scope.attendanceDate = 0;

      // panel de la izquierda en detalles
      $scope.panels = {
        "students": {
          "courseId": 0,
          "courseName": "",
          "show": false
        },
        "attendance": {
          "courseId": 0,
          "courseName": "",
          "show": false
        },
        "newScholarship": {
          "studentId": "",
          "amount": 0
        }
      };

      $scope.isCreatingCourse = function(){
        return $scope.studentsWithScholarship == null;
      };

      $scope.create = function(){
        console.log($scope.courseForm);
        var success = CourseService.createCourse($scope.course);
        console.log("Saved? ");
        console.log(success);
      };

      $scope.selectStudent = function(studentId){
        $scope.selectedStudent = PeopleService.getCourseStudent($scope.course.id, studentId);
      };

      function fillPanelWithCourseInfo(id, panelName){
        var course = $scope.courses.filter(function(elem){ return elem.id === id; })[0];
        $scope.panels[panelName].courseName = course.name;
        $scope.panels[panelName].courseId = course.id;
      }

      $scope.toggleViewStudents = function(courseId){
        if($scope.panels.students.show  && $scope.panels.students.courseId === courseId){
          $scope.panels.students.show = false;
        } else {
          $scope.panels.students.show = true;
          fillPanelWithCourseInfo(courseId, "students");
          $scope.panels.students.studentsList = PeopleService.getStudentsFromCourse(courseId);
        }
      };

      $scope.toggleViewAttendance = function(courseId){
        if($scope.panels.attendance.show && $scope.panels.attendance.courseId === courseId){
          $scope.panels.attendance.show = false;
        } else {
          $scope.panels.attendance.show = true;
          fillPanelWithCourseInfo(courseId, "attendance");
          $scope.panels.attendance.sessions = CourseService.getCourseSessions(courseId);
					fillDateLabels($scope.panels.attendance.sessions);
        }
      };

      $scope.changeToPartialPayment = function(studentId){
        $scope.students.filter(function(elem){ return elem.id === studentId; })[0].paymentType = 2;
        $("#payment" + studentId).attr("type", "number");
      };

      $scope.changeToLaterPayment = function(studentId){
        $scope.students.filter(function(elem){ return elem.id === studentId; })[0].paymentType = 3;
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

      $scope.getStudentsWithScholarship = function(courseId){
        $scope.studentsWithScholarship = PeopleService.getCourseScholarships(courseId);
      };

      $scope.getStudentsWithPendingPayments = function(courseId){
        $scope.studentsWithPendingPayments = PeopleService.getCourseDebts(courseId);
      };

      $scope.initCourseList = function(){
        $scope.courses = CourseService.getCourses();
      };

      function fillDateLabels(sessions){
        sessions.forEach(function(session){
          session.label = $scope.getDateLabel(session.session_date);
        });
      }

      $scope.$watch("$scope.panels.attendance.sessions", function(newValue, oldValue){
        if(newValue){
          fillDateLabels($scope.panels.attendance.sessions);
        }
      });

      $scope.$watch("selectedStudent.$resolved", function(newValue, oldValue){
        if(newValue){
          fillDateLabels($scope.selectedStudent.unattendance);
        }
      });

      $scope.$watch("sessions.$resolved", function(newValue, oldValue){
        if(newValue){
          fillDateLabels($scope.sessions);
        }
      });

      $scope.$watch("course.$resolved", function(newValue, oldValue){
        if(newValue){
          $scope.course.beginLabel = $scope.getDateLabel($scope.course.begin);
          $scope.course.endLabel = $scope.getDateLabel($scope.course.end);
        }
      });

      if($routeParams.courseId){
        var courseId = parseInt($routeParams.courseId);
        $scope.course = CourseService.getCourse(courseId);
        $scope.getStudentsWithScholarship(courseId);
        $scope.getStudentsWithPendingPayments(courseId);
        $scope.sessions = CourseService.getCourseSessions(courseId);
      } else {
        $scope.course = {
          "name": "",
          "code": "",
          "cost": 0,
          "begin": "",
          "end": "",
          "day": 0,
          "hour": "18:00",
        };
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

      $scope.todayBirthdays = [
      {"id": 1, "name": "Susana Alvarado", "age": 31}
      ];
    }]
    );

/*
 *   Directive
 */

app.directive('navigation', function(){
  "use strict";

  return {
    replace: true,
    templateUrl: 'pages/navigation.html'
  };
});

app.directive('studentList', function(){
  "use strict";

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
  "use strict";

  return {
    replace: true,
    templateUrl: 'pages/partials/vistaCurso.html'
  };
});

app.directive('detailedCourseView', function(){
  "use strict";

  return {
    replace: true,
    templateUrl: 'pages/partials/vistaDetalladaCurso.html'
  };
});

app.directive('studentListFullOpc', function(){
  "use strict";

  return {
    replace: true,
    templateUrl: 'pages/partials/listaEstudiantesOpcionesCompletas.html'
  };
});

app.directive('studentView', function(){
  "use strict";

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
  "use strict";

  return {
    replace: true,
    templateUrl: 'pages/partials/inscribeReservaCurso.html'
  };
});

function createPaymentChange(paymentType, debt, element, styleId, type){
  "use strict";

  return function(){
    debt.paymentType = paymentType;
    $(element).find("#" + styleId + debt.id).attr("type", type);
  };
}

app.directive('paymentOptionsCompact', function(){
  "use strict";

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
  "use strict";

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
  "use strict";

  return {
    replace: true,
    templateUrl: 'pages/partials/buscarAsistencia.html',
    scope: {
      courseId: '&courseId',
      sessions: '='
    },
    link: function(scope, element, attrs){
      scope.attendanceDate = "";
      scope.attendance = null;

      scope.getAttendance = function(){
        scope.attendance = CourseService.getAttendance(scope.courseId(), scope.attendanceDate);
      };
    }
  };
}]);

app.directive('scholarships', [function(){
  "use strict";

  return {
    replace: true,
    scope: {
      scholarships: '=model'
    },
    templateUrl: 'pages/partials/becas.html'
  };
}]);

/*
 *   Factory
 */
app.factory('PeopleService', ['$resource', function($resource){
  "use strict";

  var PersonResource = $resource('http://localhost:4567/people/:personId', {personId: '@id'});
  var CourseResource = $resource('http://localhost:4567/courses/:courseId/:action/:actionId', {courseId: '@courseId', action: '@action', actionId: '@actionId'});

  return {
    createStudent: function(student){
      console.log(student);
      return PersonResource.save(student);
    },

    listStudents: function(){
      return PersonResource.query();
    },

    getStudentsFromCourse: function(courseId){
      return CourseResource.query({courseId: courseId, action: "students"});
    },

    getCourseStudent: function(courseId, personId){
      return CourseResource.get({courseId: courseId, action: "students", actionId: personId});
    },

    getStudent: function(personId){
      return PersonResource.get({personId: personId});
    },

    getCourseDebts: function(courseId){
      return CourseResource.query({courseId: courseId, action: "debts"});
    },

    getCourseScholarships: function(courseId){
      return CourseResource.query({courseId: courseId, action: "scholarships"});
    }
  };
}]);

app.factory('CatalogService', ['$resource', function($resource){
  "use strict";

  var CatalogResource = $resource('http://localhost:4567/catalogs/:catalogId', {catalogId: '@id'});

  return {
    phoneTypes: function(){
      return CatalogResource.query({catalogId: 'phone'});
    }
  };
}]);

app.factory('CourseService', ['$resource', function($resource){
  "use strict";

  var CourseResource = $resource('http://localhost:4567/courses/:courseId/:action/:actionId', {courseId: '@courseId', action: '@action', actionId: '@actionId'});

  return {
    createCourse: function(course){
      console.log(course);
      return CourseResource.save(course);
    },

    getCourse: function(courseId){
      return CourseResource.get({courseId: courseId});
    },

    getCourseSessions: function(courseId){
      return CourseResource.query({courseId: courseId, action: "sessions"});
    },

    getCourses: function(){
      return CourseResource.query();
    },

    getOpenCourses: function(){
      return CourseResource.query({action: "open"});
    },

    getAttendance: function(courseId, date){
      return CourseResource.query({courseId: courseId, action: "attendance", date: date});
    },
  };
}]);
