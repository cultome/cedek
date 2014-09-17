/* jshint strict: true */
var app = angular.module('CEDEK');

var serviceEndpoint = "http://localhost:4567";

app.factory('PeopleService', ['$resource', function($resource){
  "use strict";

  var PersonResource = $resource(serviceEndpoint + '/people/:personId', {personId: '@id'},
      {'update': { method: 'PUT' }}
      );
  var CourseResource = $resource(serviceEndpoint + '/courses/:courseId/:action/:actionId', {courseId: '@courseId', action: '@action', actionId: '@actionId'});

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
      return PersonResource.update({personId: personId}, student);
    },

    createStudent: function(student, successCb, failCb){
      return PersonResource.save(student, successCb, failCb);
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
    },

    birthdaysToday: function(successCb, failCb){
      return PersonResource.query({birthday: "today"}, successCb, failCb);
    }
  };
}]);
















app.factory('CourseService', ['$resource', function($resource){
  "use strict";

  var CourseResource = $resource(serviceEndpoint + '/courses/:courseId/:action/:actionId', {courseId: '@courseId', action: '@action', actionId: '@actionId'},
      {'update': { method: 'PUT' }}
      );

  return {

    unrollStudent: function(courseId, studentId, successCb, failCb){
      return CourseResource.delete({courseId: courseId, action: "unroll", actionId: studentId}, successCb, failCb);
    },

    giveScholarship: function(courseId, studentId, amount, successCb, failCb){
      return CourseResource.save({courseId: courseId, action: "scholarship", actionId: studentId, amount: amount}, successCb, failCb);
    },

    subscribeStudent: function(courseId, studentId, successCb, failCb){
      return CourseResource.save({courseId: courseId, action: "subscribe", actionId: studentId}, successCb, failCb);
    },

    checkAttendance: function(courseId, studentId, sessionDate, successCb, failCb){
      return CourseResource.save({courseId: courseId, action: "attendance", actionId: studentId, sessionDate: sessionDate}, successCb, failCb);
    },

    createCourse: function(course, successCb, failCb){
      return CourseResource.save(course, successCb, failCb);
    },

    updateCourse: function(courseId, courseData){
      var course = angular.copy(courseData);
      delete course.scholarships;
      delete course.students;
      delete course.beginLabel;
      delete course.endLabel;
      delete course.id;
      delete course.schedule;
      return CourseResource.update({courseId: courseId}, course);
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

    getComingCourses: function(successCb, failCb){
      return CourseResource.query({coming: true}, successCb, failCb);
    },

    getTodayCourses: function(successCb, failCb){
      return CourseResource.query({today: true}, successCb, failCb);
    },

    getActiveCourses: function(successCb, failCb){
      return CourseResource.query({active: true}, successCb, failCb);
    },

    getOpenCourses: function(){
      return CourseResource.query({open: true});
    },

    getAttendance: function(courseId, date, successCb, failCb){
      return CourseResource.query({courseId: courseId, action: "attendance", date: date}, successCb, failCb);
    },
  };
}]);












app.factory('ScholarshipService', ['$resource', function($resource){
  "use strict";

  var ScholarshipResource = $resource(serviceEndpoint + '/scholarship/:scholarshipId', {scholarshipId: '@id'});

  return {
    revoke: function(scholarshipId, successCb, failCb){
      return ScholarshipResource.delete({scholarshipId: scholarshipId}, successCb, failCb);
    }
  };
}]);

















app.factory('DebtService', ['$resource', function($resource){
  "use strict";

  var DebtResource = $resource(serviceEndpoint + '/debts/:action/:actionId', {action: '@action'});

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











app.factory('CatalogService', ['$resource', function($resource){
  "use strict";

  var CatalogResource = $resource(serviceEndpoint + '/catalogs/:catalogId', {catalogId: '@id'});

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

