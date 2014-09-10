/* jshint strict: true */
angular.module('CEDEK').controller('PeopleCtrl', ['$scope', '$routeParams', '$location', 'PeopleService', 'CourseService', 'CatalogService',
    function($scope, $routeParams, $location, PeopleService, CourseService, CatalogService){
      'use strict';

      // list students
      $scope.students = null;
      $scope.student = null;

      $scope.panels = {
        "subscribe": {
          "courses": []
        },

        "phone": {
          "isAddingPhone": false,
          "phoneTypes": CatalogService.phoneTypes(),
          "number": "",
          "phone_type_id": 1
        },
      };

      function onStudentUpdate(student){
        if($scope.students != null){
          var idx = $scope.students.indexOf($scope.students.filter(function(e,idx){return e.id === student.id;})[0]);
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

      $scope.create = function(student){
        PeopleService.createStudent(student, function(res){
          $location.path("personas/listar");
        });
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
        if(!$scope.panels.phone.number.match(/^[\s]*$/)){
          $scope.student.phones.push({
            "number": $scope.panels.phone.number,
            "phone_type_id": $scope.panels.phone.phone_type_id
          });
        }
        // reseteamos el campo
        $scope.panels.phone.isAddingPhone = false;
        $scope.panels.phone.number = "";
      };

      $scope.initStudentList = function(){
        $scope.students = PeopleService.listStudents();
        $scope.panels.subscribe.courses = CourseService.getOpenCourses();
      };

      $scope.addingPhone = function(){
        return $scope.panels.phone.isAddingPhone;
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
      } else {
        $scope.student = {
          "name": "",
          "has_scholarship": false,
          "scholarship_percentage": '',
          "lead_pray_group": false,
          "phones": []
        };
      }
    }]
);


