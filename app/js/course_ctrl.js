/* jshint strict: true */
angular.module('CEDEK').controller('CourseCtrl', ['$scope', '$routeParams', '$location', 'PeopleService', 'CourseService', 'DebtService', 'ScholarshipService',
    function($scope, $routeParams, $location, PeopleService, CourseService, DebtService, ScholarshipService){
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
          "studentList": [],
          "fullStudentList": [],
          "sync": function(currentStudents){
            $scope.panels.subscribe.studentList = $scope.panels.subscribe.fullStudentList.filter(function(s){
              return currentStudents.filter(function(x){ return s.id === x.id; }).length === 0;
            });
          }
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
        $scope.$emit("enrollmentUpdated", courseId);
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
          $scope.notify(course.name + " agregado!", "success");
        });
      };

      $scope.goToDetails = function(courseId){
        $location.path("/curso/" + courseId);
      };

      $scope.update = function(courseId, course){
        return CourseService.updateCourse(courseId, course, function(){
          $scope.notify("Curso '" + course.name + "' actualizado", "success");
        }, function(response){
          $scope.notify(response.data, "error");
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
          //$scope.panels.students.courseId = courseId;
          $scope.$emit("enrollmentUpdated", courseId);
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
        data.name = debt.person_name;
        data.confirm = function(){
          DebtService.payNow(debt.id,
              function(){
                $scope.$emit("paymentsUpdated", debt.course_id, debt.person_id);
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

      $scope.attendToday = function(studentId){
        return $scope.panels.attendance.attendanceToday.filter(function(session){ return session.id === studentId && session.attend; }).length > 0;
      };

      $scope.$on("removeStudentFromCourse", function(evt, courseId, studentId, studentName){
        var data = $scope.alerts.confirmRemoveStudentFromCourse;
        data.name = studentName;
        data.confirm = function(){
          CourseService.unrollStudent(courseId, studentId,
              function(){
                $scope.$emit("enrollmentUpdated", courseId);
                $("#confirmRemoveStudentFromCourse").modal('hide');
              },
              function(){
                console.log("Error processing the unrollment.");
                $("#confirmRemoveStudentFromCourse").modal('hide');
              }
              );
        };
      });

      $scope.$on("enrollmentUpdated", function(evt, courseId){
        PeopleService.getStudentsFromCourse(courseId, function(newStudents){
          $scope.course.students = newStudents;
          $scope.panels.students.studentsList = newStudents;
          $scope.panels.subscribe.sync(newStudents);
        });
      });

      $scope.$on("deleteScholarship", function(evt, scholarshipId, courseId, studentName){
        var data = $scope.alerts.confirmDeleteScholarship;
        data.name = studentName;
        data.confirm = function(){
          ScholarshipService.revoke(scholarshipId,
            function(){
              $scope.getStudentsWithScholarship(courseId);
              $("#confirmDeleteScholarship").modal('hide');
            },
            function(){
              console.log("Error processing the scholarship revocation.");
              $("#confirmDeleteScholarship").modal('hide');
            }
          );
        };
        $scope.$apply($scope.alerts.confirmDeleteScholarship);
      });

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

        PeopleService.listStudents(function(students){
          $scope.panels.subscribe.fullStudentList = students;
          $scope.panels.scholarship.studentsWithNoScholarship = students;

          CourseService.getCourse(courseId, function(course){
            if($scope.thereAreSessionToday(course.day)){
              $scope.panels.attendance.attendanceToday = CourseService.getAttendance(course.id, $scope.today());
            }
            course.cost = parseFloat(course.cost);
            course.hour = course.hour.substring(11, 16);
            course.beginLabel = $scope.getDateLabel(course.begin);
            course.endLabel = $scope.getDateLabel(course.end);

            $scope.course = course;

            $scope.panels.subscribe.sync(course.students);
          });
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

