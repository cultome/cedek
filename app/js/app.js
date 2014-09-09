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
  $scope.alerts = {
    "confirmDebtClose": {
      amount: 0,
      name: "_none_"
    }
  };

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
        "phones": []
      };
      $scope.phone = {"number": "", "phone_type_id": 1};
      $scope.isAddingPhone = false;
      $scope.phoneTypes = CatalogService.phoneTypes();

      function onStudentUpdate(student){
        if($scope.students != null){
          var idx = $scope.students.indexOf($scope.students.filter(function(e,idx){return e.id === student.id})[0]);
          $scope.students[idx] = student;
        }

        if(student.debts){
          student.debts.forEach(function(debt){
            debt.commitmentLabel = $scope.getDateLabel(debt.commitment);
          });
        }
      }

      function getStudent(studentId){
        $scope.student = PeopleService.getStudent(studentId, onStudentUpdate);
      }

      // deprecate
      $scope.create = function(){
        console.log($scope.studentForm);
        var success = PeopleService.createStudent($scope.student);
        console.log("Saved? ");
        console.log(success);
      };

      $scope.update = function(personId){
        var success = PeopleService.updateStudent(personId, $scope.student);
        console.log("Updated? ");
        console.log(success);
      };

      $scope.isCreatingPerson = function(){
        return $scope.student.scholarships == null;
      };

      $scope.hasAcademicHistory = function(){
        return $scope.student.enrollments || $scope.student.reserves || $scope.student.previous;
      };

      $scope.addAnotherPhone = function(){
        if(!$scope.phone.number.match(/^[\s]*$/)){
          $scope.student.phones.push({
            "number": $scope.phone.number,
            "phone_type_id": $scope.phone.phone_type_id
          });
        }
        $scope.isAddingPhone = false;
        $scope.phone = {"number": "", "phone_type_id": 1};
      };

      $scope.initStudentList = function(){
        $scope.students = PeopleService.listStudents();
        $scope.courses = CourseService.getOpenCourses();
      };

      $scope.addingPhone = function(){
        return $scope.isAddingPhone;
      };

      $scope.$on("subscribeStudentToCourse", function(evt, courseId, studentId){
        getStudent(studentId);
      });

      $scope.$on("paymentsUpdated", function(evt, courseId, studentId){
        getStudent(studentId);
      });

      $scope.$on("deletePhone", function(evt, number, phone_type){
        $scope.student.phones = $scope.student.phones.filter(function(phone){
          return phone.number !== number && phone.phone_type_id !== phone_type;
        });

        $scope.$apply($scope.student);
      });

      if($routeParams.personId){
        getStudent(parseInt($routeParams.personId));
      }
    }]
);

app.controller('CourseCtrl', ['$scope', '$routeParams', 'PeopleService', 'CourseService', 'DebtService',
    function($scope, $routeParams, PeopleService, CourseService, DebtService){
      'use strict';

      //$scope.course = null;
      $scope.courses = null;
      $scope.attendanceToday = [];

      // panel de la izquierda en detalles
      $scope.panels = {
        "students": {
          "courseId": 0,
          "courseName": "",
          "show": false,
        },

        "attendance": {
          "courseId": 0,
          "courseName": "",
          "show": false,
          "sessions": [],
          "getSessions": function(courseId){
            return CourseService.getCourseSessions(courseId, function(sessions){
              fillDateLabels(sessions);
              $scope.panels.attendance.sessions = sessions;
            });
          }
        },

        "courseStudent": {
          "student": null,
          "getStudent": function(courseId, studentId){
            PeopleService.getCourseStudent(courseId, studentId, function(student){
              fillDateLabels(student.unattendance);
              $scope.panels.courseStudent.student = student;
            });
          }
        },

        "payment": {
          "students": null
        },

        "scholarship": {
          "studentId": null,
          "courseId": null,
          "amount": 0,
          "students": null,
          "studentsWithNoScholarship": null
        },

        "subscribe": {
          "studentId": "",
          "studentList": []
        }
      };

      function fillDateLabels(sessions){
        sessions.forEach(function(session){
          session.label = $scope.getDateLabel(session.session_date);
        });
      }

      function fillPanelWithCourseInfo(id, panelName){
        var course = $scope.courses.filter(function(elem){ return elem.id === id; })[0];
        $scope.panels[panelName].courseName = course.name;
        $scope.panels[panelName].courseId = course.id;
      }

      $scope.giveScholarship = function(courseId){
        CourseService.giveScholarship(courseId, $scope.panels.scholarship.studentId, $scope.panels.scholarship.amount, function(){
          $scope.getStudentsWithScholarship(courseId);
        });
      };

      $scope.subscribe = function(courseId, studentId){
        CourseService.subscribeStudent(courseId, studentId);
        PeopleService.getStudentsFromCourse(courseId, function(newStudents){
          $scope.course.students = newStudents;
        });
      };

      $scope.thereAreSessionToday = function(courseDay){
        return courseDay === new Date().getDay();

      };

      $scope.checkAttendance = function(courseId, studentId){
        var today = $scope.today();
        CourseService.checkAttendance(courseId, studentId,  $scope.today(), function(){
          // checamos si tenemos que actualizar las sessions
          var todaySessions = $scope.panels.attendance.sessions.filter(function(s){
            return s.session_date === today;
          });

          if(todaySessions.length === 0){
            $scope.panels.attendance.getSessions(courseId);
            $scope.attendanceToday = CourseService.getAttendance(courseId, $scope.today());
          }

          $scope.attendanceToday.forEach(function(session){
            if(session.id === studentId){
              session.attend = true;
            }
            return session;
          });

        });
      };

      $scope.isCreatingCourse = function(){
        return $scope.panels.scholarship.students == null;
      };

      $scope.create = function(){
        var success = CourseService.createCourse($scope.course);
        console.log("Saved? ");
        console.log(success);
      };

      $scope.selectStudent = function(studentId){
        $scope.panels.courseStudent.getStudent($scope.course.id, studentId);
      };

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
          $scope.panels.attendance.getSessions(courseId);
        }
      };

      $scope.hidePaymentOptions = function(studentId){
        var section = $("#paymentOption" + studentId);
        section.css("display", "none");
      };

      $scope.togglePaymentOptions = function(studentId){
        var section = $("#paymentOption" + studentId);
        if(section.css("display") === "none"){
          section.css("display", "");
        } else {
          $scope.hidePaymentOptions(studentId);
        }
      };

      $scope.getStudentsWithPendingPayments = function(courseId){
        PeopleService.getCourseDebts(courseId, function(students){
          students.forEach(function(student){
            student.commitmentLabel = $scope.getDateLabel(student.commitment);
          });
          $scope.panels.payment.students = students;
        });
      };

      $scope.confirmDebtClose = function(debt){
        var data = $scope.alerts.confirmDebtClose;
        data.amount = debt.amount;
        data.name = debt.student_name;
        data.confirm = function(){
          DebtService.payNow(debt.id,
            function(){
              $scope.$emit("paymentsUpdated", debt.course_id, debt.student_id);
              $("#confirmCloseDebt").modal('hide');
            },
            function(){
              console.log("Error processing the payment.");
            }
          );
        };
      };

      $scope.getStudentsWithScholarship = function(courseId){
        PeopleService.getCourseScholarships(courseId, function(students){
          $scope.panels.scholarship.courseId = courseId;
          $scope.panels.scholarship.students = students;
        });
      };

      $scope.initCourseList = function(){
        CourseService.getCourses(function(courses){
          $scope.courses = courses;
          courses.forEach(function(course){
            course.beginLabel = $scope.getDateLabel(course.begin);
            course.endLabel = $scope.getDateLabel(course.end);
          });
        });
      };

      $scope.initCourseView = function(){
        PeopleService.listStudents(function(students){
          $scope.panels.subscribe.studentList = students;
          $scope.panels.scholarship.studentsWithNoScholarship = students;
        });
      };

      $scope.attendToday = function(studentId){
        return $scope.attendanceToday.filter(function(session){ return session.id === studentId && session.attend; }).length > 0;
      };

      $scope.$on("paymentsUpdated", function(evt, courseId, studentId){
        $scope.getStudentsWithPendingPayments(courseId);
        $scope.selectStudent(studentId);
        evt.currentScope.hidePaymentOptions(studentId);
      });

      if($routeParams.courseId){
        var courseId = parseInt($routeParams.courseId);
        CourseService.getCourse(courseId, function(course){
          if($scope.thereAreSessionToday(course.day)){
            $scope.attendanceToday = CourseService.getAttendance(course.id, $scope.today());
          }
          course.beginLabel = $scope.getDateLabel(course.begin);
          course.endLabel = $scope.getDateLabel(course.end);

          $scope.course = course;
        });

        $scope.getStudentsWithScholarship(courseId);
        $scope.getStudentsWithPendingPayments(courseId);
        $scope.panels.attendance.getSessions(courseId);

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

app.directive('studentView', ['DebtService', 'PeopleService', function(DebtService, PeopleService){
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
    templateUrl: 'pages/partials/vistaEstudiante.html',
    link: function(scope, elem, attr){
      scope.confirmDebtClose = function(debt){
        var data = scope.$parent.alerts.confirmDebtClose;
        data.amount = debt.amount;
        data.name = debt.student_name;
        data.confirm = function(){
          DebtService.payNow(debt.id,
              function(){
                scope.$emit("paymentsUpdated", debt.course_id, debt.student_id);
                $("#confirmCloseDebt").modal('hide');
              },
              function(){
                console.log("Error processing the payment.");
              });
        };
      };
    },
  };
}]);

app.directive('subscribeCourse', ['CourseService', function(CourseService){
  "use strict";

  return {
    replace: true,
    scope: {
      student: "=",
      courses: "="
    },
    templateUrl: 'pages/partials/inscribeReservaCurso.html',
    link: function(scope, element, attr){
      scope.subscribe = function(){
        var response = CourseService.subscribeStudent(scope.courseSelected, scope.student.id);
        scope.$emit("subscribeStudentToCourse", scope.courseSelected, scope.student.id);
        return response;
      };

      scope.coursesAvailableForStudent = function(){
        var filtered = scope.courses.filter(function(c){
          var enrolled = scope.student.enrollments ? scope.student.enrollments.filter(function(e){ return e.id === c.id; }) : [];
          var reserved = scope.student.reserves ? scope.student.reserves.filter(function(r){ return r.id === c.id; }) : [];
          return enrolled.length === 0 && reserved.length === 0;
        });

        return filtered;
      };
    }
  };
}]);

function createPaymentChange(paymentType, data, studentId, element, styleId, type){
  "use strict";

  return function(){
    data.payment = null;
    data.paymentType = paymentType;
    $(element).find("input").attr("type", type);
  };
}

function refreshStudentsWithPendingPaymentsCB(scope, courseId, studentId){
  return function(){
    scope.$emit("paymentsUpdated", courseId, studentId);
  };
}

function registerPayment(scope, DebtService){
  return function(){
    if(scope.data.paymentType === 2){ // pago parcial
      return DebtService.makePayment(scope.student, scope.course, scope.data.payment, scope.amount, refreshStudentsWithPendingPaymentsCB(scope, scope.course, scope.student));
    } else if(scope.data.paymentType === 3){ // pago posterior
      return DebtService.payLater(scope.student, scope.course, scope.amount, scope.charge, scope.data.payment, refreshStudentsWithPendingPaymentsCB(scope, scope.course, scope.student));
    }
  };
}

function isInputEnabled(student){
  return function(){
    return student.paymentType === 2 || student.paymentType === 3;
  }
}

app.directive('paymentOptionsCompact', ['DebtService', function(DebtService){
  "use strict";

  return {
    replace: true,
    scope: {
      course: '=course',
      student: '=student',
      amount: '=amount',
      charge: '@charge'
    },
    link: function(scope, element, attrs){
      scope.data = {payment: null, paymentType: null};
      scope.changeToLaterPayment = createPaymentChange(3, scope.data, scope.student, element, "paymentSmall", "date");
      scope.changeToPartialPayment = createPaymentChange(2, scope.data, scope.student, element, "paymentSmall", "number");
      scope.isInputEnabled = isInputEnabled(scope.data);
      scope.registerPayment = registerPayment(scope, DebtService);
    },
    templateUrl: 'pages/partials/opcionesPagoCompacto.html'
  };
}]);

app.directive('paymentOptions', ['DebtService', function(DebtService){
  "use strict";

  return {
    replace: true,
    scope: {
      course: '=course',
      student: '=student',
      amount: '=amount',
      charge: '@charge'
    },
    templateUrl: 'pages/partials/opcionesPago.html',
    link: function(scope, element, attrs){
      scope.data = {payment: null, paymentType: null};
      scope.changeToLaterPayment = createPaymentChange(3, scope.data, scope.student, element, "payment", "date");
      scope.changeToPartialPayment = createPaymentChange(2, scope.data, scope.student, element, "payment", "number");
      scope.isInputEnabled = isInputEnabled(scope.data);
      scope.registerPayment = registerPayment(scope, DebtService);
    }
  };
}]);

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

      scope.$watch("courseId()", function(){
        scope.attendance = [];
      });

      scope.getAttendance = function(){
        scope.attendance = CourseService.getAttendance(scope.courseId(), scope.attendanceDate);
      };
    }
  };
}]);

app.directive('phone', ['CatalogService', function(CatalogService){
  "use strict";

  return {
    replace: true,
    scope: {
      model: '='
    },
                  
    template: '<span><span><strong>{{model.number}}</strong></span><span class="phone-type label label-default pull-right" style="width: 50px;">{{getPhoneTypeName()}}</span></span>',
    link: function(scope, elem, attr){
      var phoneTypes = CatalogService.phoneTypes();

      scope.getPhoneTypeName = function(){
        if(phoneTypes <= 1){
          return "";
        }

        var type = phoneTypes.filter(function(elem){ return elem.id === scope.model.phone_type_id; })[0];
        if(type === undefined){
          return "Desconocido";
        }

        return type.name;
      };

      $(elem).find(".phone-type").hover(function(){
        $(this).text("X");
      }).mouseout(function(){
        var originalText = scope.getPhoneTypeName();
        $(this).text(originalText);
      }).click(function(){
        scope.$emit("deletePhone", scope.model.number, scope.model.phone_type_id);
      });
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
app.factory('DebtService', ['$resource', function($resource){
  "use strict";

  var DebtResource = $resource('http://localhost:4567/debts/:action/:actionId', {action: '@action'});

  return {
    makePayment: function(studentId, courseId, payment, amount, successCb, failCb){
      console.log("makePayment:::studentId: " + studentId + ", courseId: " + courseId + ", payment: " + payment + ", amount: " + amount);
      return DebtResource.save({studentId: studentId, courseId: courseId, payment: payment, amount: amount, action: "pay"}, successCb, failCb);
    },

    payLater: function(studentId, courseId, amount, charge, date, successCb, failCb){
      console.log("payLater:::studentId: " + studentId + ", courseId: " + courseId + ", amount: " + amount + ", charge: " + charge + ", date: " + date);
      var chrgBool = charge === "true";
      return DebtResource.save({studentId: studentId, courseId: courseId, date: date, charge: chrgBool, amount: amount, action: "later"}, successCb, failCb);
    },
    payNow: function(debtId, successCb, failCb){
      return DebtResource.delete({actionId: debtId, action: 'remove'}, successCb, failCb);
    }
  };
}]);

app.factory('PeopleService', ['$resource', function($resource){
  "use strict";

  var PersonResource = $resource('http://localhost:4567/people/:personId', {personId: '@id'},
    {'update': { method: 'PUT' }}
  );
  var CourseResource = $resource('http://localhost:4567/courses/:courseId/:action/:actionId', {courseId: '@courseId', action: '@action', actionId: '@actionId'});

  return {
    updateStudent: function(personId, studentData){
      var student = angular.copy(studentData);
      // removemos propiedades que no sirven
      delete student.id;
      delete student.debts;
      delete student.previous;
      delete student.reserves;
      delete student.enrollments;
      delete student.scholarships;
      console.log(studentData);
      return PersonResource.update({personId: personId}, student);
    },

    createStudent: function(student){
      console.log(student);
      return PersonResource.save(student);
    },

    listStudents: function(successCb, failCb){
      return PersonResource.query({}, successCb, failCb);
    },

    getStudentsFromCourse: function(courseId, successCb, failCb){
      return CourseResource.query({courseId: courseId, action: "students"}, successCb, failCb);
    },

    getCourseStudent: function(courseId, personId, successCb, failCb){
      return CourseResource.get({courseId: courseId, action: "students", actionId: personId}, successCb, failCb);
    },

    getStudent: function(personId, successCb, failCb){
      return PersonResource.get({personId: personId}, successCb, failCb);
    },

    getCourseDebts: function(courseId, successCb, failCb){
      return CourseResource.query({courseId: courseId, action: "debts"}, successCb, failCb);
    },

    getCourseScholarships: function(courseId, successCb, failCb){
      return CourseResource.query({courseId: courseId, action: "scholarships"}, successCb, failCb);
    }
  };
}]);

app.factory('CatalogService', ['$resource', function($resource){
  "use strict";

  var CatalogResource = $resource('http://localhost:4567/catalogs/:catalogId', {catalogId: '@id'});

  return {
    cache: null,
    phoneTypes: function(){
      if(this.cache === null){
        this.cache = CatalogResource.query({catalogId: 'phone'});
      }
      return this.cache;
    }
  };
}]);

app.factory('CourseService', ['$resource', function($resource){
  "use strict";

  var CourseResource = $resource('http://localhost:4567/courses/:courseId/:action/:actionId', {courseId: '@courseId', action: '@action', actionId: '@actionId'});

  return {
    giveScholarship: function(courseId, studentId, amount, successCb, failCb){
      return CourseResource.save({courseId: courseId, action: "scholarship", actionId: studentId, amount: amount}, successCb, failCb);
    },

    subscribeStudent: function(courseId, studentId){
      return CourseResource.save({courseId: courseId, action: "subscribe", actionId: studentId});
    },

    checkAttendance: function(courseId, studentId, sessionDate, successCb, failCb){
      return CourseResource.save({courseId: courseId, action: "attendance", actionId: studentId, sessionDate: sessionDate}, successCb, failCb);
    },

    createCourse: function(course){
      return CourseResource.save(course);
    },

    getCourse: function(courseId, successCb, failCb){
      return CourseResource.get({courseId: courseId}, successCb, failCb);
    },

    getCourseSessions: function(courseId, successCb, failCb){
      return CourseResource.query({courseId: courseId, action: "sessions"}, successCb, failCb);
    },

    getCourses: function(successCb, failCb){
      return CourseResource.query({}, successCb, failCb);
    },

    getOpenCourses: function(){
      return CourseResource.query({action: "open"});
    },

    getAttendance: function(courseId, date){
      return CourseResource.query({courseId: courseId, action: "attendance", date: date});
    },
  };
}]);
