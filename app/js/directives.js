/* jshint strict: true */
var app = angular.module('CEDEK');

function createPaymentChange(paymentType, data, studentId, element, styleId, type){
  "use strict";

  return function(){
    data.payment = null;
    data.paymentType = paymentType;
    $(element).find("input").attr("type", type);
  };
}

function refreshStudentsWithPendingPaymentsCB(scope, courseId, studentId){
  "use strict";
  return function(){
    scope.$emit("paymentsUpdated", courseId, studentId);
  };
}

function registerPayment(scope, DebtService){
  "use strict";
  return function(){
    if(scope.data.paymentType === 2){ // pago parcial
      return DebtService.makePayment(scope.student, scope.course, scope.data.payment, scope.amount, refreshStudentsWithPendingPaymentsCB(scope, scope.course, scope.student));
    } else if(scope.data.paymentType === 3){ // pago posterior
      return DebtService.payLater(scope.student, scope.course, scope.amount, scope.charge, scope.data.payment, refreshStudentsWithPendingPaymentsCB(scope, scope.course, scope.student));
    }
  };
}

function isInputEnabled(student){
  "use strict";
  return function(){
    return student.paymentType === 2 || student.paymentType === 3;
  };
}

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
      showAttendance: '@showAttendance',
      course: "=",
      editable: "@"
    },
    templateUrl: 'pages/partials/listaEstudiantes.html',
    link: function(scope, elem, attr){
      scope.removeStudentFromCourse = function(courseId, studentId, studentName){
        scope.$emit("removeStudentFromCourse", courseId, studentId, studentName);
      };
    }
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
        if(!scope.attendanceDate.match("^[\\d]{4}-[\\d]{1,2}-[\\d]{1,2}$")){
          console.log("Fecha de sesion invalida!");
          return ;
        }

        CourseService.getAttendance(scope.courseId(), scope.attendanceDate, function(attendance){
          scope.attendance = attendance;
          scope.$emit("attendanceDateUpdated", scope.courseId(), scope.attendanceDate);
        });
      };

      scope.$on("attendanceUpdated", function(evt, courseId, studentId, sessionDate, currentSessionDate){
        if(currentSessionDate === sessionDate){
          scope.getAttendance();
        }
      });
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

    template: '<span><span><strong>{{model.number}}</strong></span><span class="deletable label label-default pull-right" style="width: 50px;">{{getPhoneTypeName}}</span></span>',
    link: function(scope, elem, attr){
      var phoneTypes = CatalogService.phoneTypes();

      function getTypeName(){
        if(phoneTypes <= 1){
          return "";
        }

        var type = phoneTypes.filter(function(elem){ return elem.id === scope.model.phone_type_id; })[0];
        if(type === undefined){
          return "Desconocido";
        }

        return type.name;
      }

      scope.getPhoneTypeName = getTypeName();

      $(elem).find(".deletable").hover(function(){
        $(this).text("X");
      }).mouseout(function(){
        $(this).text(scope.getPhoneTypeName);
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
      scholarships: '=model',
      editable: "@"
    },
    templateUrl: 'pages/partials/becas.html'
  };
}]);


app.directive('alerts', [function(){
  "use strict";

  return {
    replace: true,
    templateUrl: 'pages/partials/alertas.html'
  };
}]);

app.directive('studentScholarshipPercentage', [function(){
  "use strict";

  return {
    replace: true,
    scope: {
      scholarship: "=",
      editable: "@"
    },

    template: '<li class="list-group-item"><a href="#/persona/editar/{{scholarship.student_id}}">{{scholarship.student_name}}</a><span class="deletable label label-default pull-right wire-label-success" style="width: 50px;"data-toggle="modal" data-target="#confirmDeleteScholarship">{{scholarship.percentage}}%</span></li>',

    link: function(scope, elem, attrs){
      if(scope.editable === "true"){
        // editable
        $(elem).find(".deletable").hover(function(){
          $(this).text("X");
        }).mouseout(function(){
          $(this).text(scope.scholarship.percentage + "%");
        }).click(function(){
          scope.$emit("deleteScholarship", scope.scholarship.id, scope.scholarship.course_id, scope.scholarship.student_name);
        });

      } else {
        // no editable
        var e = $(elem).find(".deletable");
        e.attr("data-toggle", "");
        e.attr("data-target", "");
        e.toggleClass("deletable");
        e.toggleClass("wire-label-success");
        e.toggleClass("wire-label-default");
      }
    }
  };
}]);

