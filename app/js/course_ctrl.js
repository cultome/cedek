/* jshint strict: true */
angular.module('CEDEK').controller('CourseCtrl', ['$scope', '$routeParams', '$location', 'PeopleService', 'CourseService', 'DebtService',
    function($scope, $routeParams, $location, PeopleService, CourseService, DebtService){
      'use strict';

      $scope.course = null;
      $scope.courses = null;

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
          "sessionDate": null,
          "sessions": [],
          "getSessions": function(courseId){
            return CourseService.getCourseSessions(courseId, function(sessions){
              fillDateLabels(sessions);
              $scope.panels.attendance.sessions = sessions;
            });
          },
          "attendanceToday": []
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
        CourseService.checkAttendance(courseId, studentId,  $scope.today(), function(){
          $scope.$broadcast("attendanceUpdated", courseId, studentId, $scope.today(), $scope.panels.attendance.sessionDate);
        });
      };

      $scope.isCreatingCourse = function(){
        return $scope.panels.scholarship.students == null;
      };

      $scope.create = function(course){
        CourseService.createCourse(course, function(res){
          $location.path("/curso/editar/" + res.id);
        });
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
          courses.forEach(function(course){
            course.beginLabel = $scope.getDateLabel(course.begin);
            course.endLabel = $scope.getDateLabel(course.end);
          });
          $scope.courses = courses;
        });
      };

      $scope.initCourseView = function(){
        PeopleService.listStudents(function(students){
          $scope.panels.subscribe.studentList = students;
          $scope.panels.scholarship.studentsWithNoScholarship = students;
        });
      };

      $scope.attendToday = function(studentId){
        return $scope.panels.attendance.attendanceToday.filter(function(session){ return session.id === studentId && session.attend; }).length > 0;
      };

      $scope.$on("attendanceDateUpdated", function(evt, courseId, sessionDate){
        $scope.panels.attendance.sessionDate = sessionDate;
      });

      $scope.$on("attendanceUpdated", function(evt, courseId, studentId, sessionDate){
        // checamos si tenemos que actualizar las sessions
        var todaySessions = $scope.panels.attendance.sessions.filter(function(s){
          return s.session_date === sessionDate;
        });

        if(todaySessions.length === 0){
          $scope.panels.attendance.getSessions(courseId);
          $scope.panels.attendance.attendanceToday = CourseService.getAttendance(courseId, sessionDate);
        }

        $scope.panels.attendance.attendanceToday.forEach(function(session){
          if(session.id === studentId){
            session.attend = true;
          }
          return session;
        });

        $scope.selectStudent(studentId);
      });

      $scope.$on("paymentsUpdated", function(evt, courseId, studentId){
        $scope.getStudentsWithPendingPayments(courseId);
        $scope.selectStudent(studentId);
        evt.currentScope.hidePaymentOptions(studentId);
      });

      if($routeParams.courseId){
        var courseId = parseInt($routeParams.courseId);
        CourseService.getCourse(courseId, function(course){
          if($scope.thereAreSessionToday(course.day)){
            $scope.panels.attendance.attendanceToday = CourseService.getAttendance(course.id, $scope.today());
          }
          course.cost = parseFloat(course.cost);
          course.hour = course.hour.substring(11, 16);
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
