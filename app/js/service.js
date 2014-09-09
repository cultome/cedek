/* jshint strict: true */
var app = angular.module('CEDEK');

app.factory('DebtService', ['$resource', function($resource){
  "use strict";

  var DebtResource = $resource('http://localhost:4567/debts/:action/:actionId', {action: '@action'});

  return {
    makePayment: function(studentId, courseId, payment, amount, successCb, failCb){
      return DebtResource.save({studentId: studentId, courseId: courseId, payment: payment, amount: amount, action: "pay"}, successCb, failCb);
    },

    payLater: function(studentId, courseId, amount, charge, date, successCb, failCb){
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

    getAttendance: function(courseId, date, successCb, failCb){
      return CourseResource.query({courseId: courseId, action: "attendance", date: date}, successCb, failCb);
    },
  };
}]);

