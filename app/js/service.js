/* jshint strict: true */
var app = angular.module('CEDEK');

var serviceEndpoint = "http://localhost:92/api";
//var serviceEndpoint = "http://localhost:8000/api";

app.factory('PeopleService', ['$resource', function($resource){
  "use strict";

  var PersonResource = $resource(serviceEndpoint + '/people/:personId', {personId: '@id'},
      {'update': { method: 'PUT' }}
      );
  var CourseResource = $resource(serviceEndpoint + '/courses/:courseId/:action/:actionId', {courseId: '@courseId', action: '@action', actionId: '@actionId'});

  return {
    updateStudent: function(personId, studentData, token, successCb, failCb){
      var student = angular.copy(studentData);
      // removemos propiedades que no sirven
      delete student.id;
      delete student.debts;
      delete student.previous;
      delete student.reserves;
      delete student.enrollments;
      delete student.scholarships;
      delete student.marital_status_name;
      return PersonResource.update({personId: personId, t: token}, student, successCb, failCb);
    },

    createStudent: function(student, token, successCb, failCb){
      return PersonResource.save({t: token}, student, successCb, failCb);
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

    unrollStudent: function(courseId, studentId, token, successCb, failCb){
      return CourseResource.delete({courseId: courseId, action: "unroll", actionId: studentId, t: token}, successCb, failCb);
    },

    giveScholarship: function(courseId, studentId, amount, token, successCb, failCb){
      return CourseResource.save({courseId: courseId, action: "scholarship", actionId: studentId, amount: amount, t: token}, successCb, failCb);
    },

    subscribeStudent: function(courseId, studentId, token, successCb, failCb){
      return CourseResource.save({courseId: courseId, action: "subscribe", actionId: studentId, t: token}, successCb, failCb);
    },

    checkAttendance: function(courseId, studentId, sessionDate, successCb, failCb){
      return CourseResource.save({courseId: courseId, action: "attendance", actionId: studentId, sessionDate: sessionDate}, successCb, failCb);
    },

    createCourse: function(course, token, successCb, failCb){
      return CourseResource.save({t: token}, course, successCb, failCb);
    },

    updateCourse: function(courseId, courseData, token, successCb, failCb){
      var course = angular.copy(courseData);
      delete course.scholarships;
      delete course.students;
      delete course.beginLabel;
      delete course.endLabel;
      delete course.id;
      delete course.schedule;
      return CourseResource.update({courseId: courseId, t: token}, course, successCb, failCb);
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
    revoke: function(scholarshipId, token, successCb, failCb){
      return ScholarshipResource.delete({scholarshipId: scholarshipId, t: token}, successCb, failCb);
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

    payNow: function(debtId, token, successCb, failCb){
      return DebtResource.delete({actionId: debtId, action: 'remove', t: token}, successCb, failCb);
    }
  };
}]);











app.factory('CatalogService', ['$resource', function($resource){
  "use strict";

  var CatalogResource = $resource(serviceEndpoint + '/catalogs/:catalogId', {catalogId: '@id'});

  return {
    phonesCache: null,
    leadersCache: null,
    maritalStatusCache: null,
    userTypesCache: null,

    phoneTypes: function(successCb, failCb){
      if(this.phonesCache === null){
        this.phonesCache = CatalogResource.query({catalogId: 'phone'}, successCb, failCb);
      }
      return this.phonesCache;
    },

    maritalStatus: function(successCb, failCb){
      if(this.maritalStatusCache === null){
        this.maritalStatusCache = CatalogResource.query({catalogId: "maritalStatus"}, successCb, failCb);
      }
      return this.maritalStatusCache;
    },

    leaders: function(successCb, failCb){
      if(this.leadersCache === null){
        this.leadersCache = CatalogResource.query({catalogId: "leaders"}, successCb, failCb);
      }
      return this.leadersCache;
    },

    userTypes: function(successCb, failCb){
      if(this.userTypesCache === null){
        this.userTypesCache = CatalogResource.query({catalogId: "userType"}, successCb, failCb);
      }
      return this.userTypesCache;
    }
  };
}]);












app.factory('UserService', ['$resource', function($resource){
  "use strict";

  var UserResource = $resource(serviceEndpoint + '/users/:userId', {userId: '@id'},
    {'update': { method: 'PUT' }}
  );

  return {
    create: function(user, token, successCb, failCb){
      return UserResource.save({t: token}, user, successCb, failCb);
    },
    
    update: function(userId, info, token, successCb, failCb){
      return UserResource.update({userId: userId, t: token}, info, successCb, failCb);
    },

    get: function(userId, successCb, failCb){
      return UserResource.get({userId: userId}, successCb, failCb);
    },

    getUsers: function(successCb, failCb){
      return UserResource.query({}, successCb, failCb);
    }

  };
}]);



app.factory('ConsultService', ['$resource', function($resource){
  "use strict";

  var ConsultResource = $resource(serviceEndpoint + '/consults/:personId', {personId: '@id'});

  var consults = {};

  return {

    cleanPacientConsult: function(personId){
      if(!consults[personId]){
        consults[personId] = {};
      }
      consults[personId].consult_date = null;
      consults[personId].reason = null;
      consults[personId].diagnostic = null;
      consults[personId].treatment = null;
      consults[personId].leader_id = null;
      consults[personId].person_id = null;
      consults[personId].drops = { "bl": false, "rj": false, "vr": false, "rs": false, "am": false };
      return consults[personId];
    },

    getCurrentConsult: function(personId, date){
      if(!consults[personId]){
        this.cleanPacientConsult(personId);
      }
      consults[personId].person_id = personId;
      consults[personId].consult_date = date;
      return consults[personId];
    },

    save: function(consult, personId, token, successCb, failCb){
      return ConsultResource.save({personId: personId, t: token}, consult, successCb, failCb);
    },

    getLastConsults: function(personId, successCb, failCb){
      return ConsultResource.query({personId: personId, recent: true}, successCb, failCb);
    },

    getAllConsults: function(personId, successCb, failCb){
      return ConsultResource.query({personId: personId}, successCb, failCb);
    }
  };
}]);










app.factory('AuthService', ['$resource', function($resource){
  "use strict";

  var AuthResource = $resource(serviceEndpoint + '/auth/:userId', {userId: '@id'},
    {'update': { method: 'PUT' }}
  );

  return {
    login: function(username, password, successCb, failCb){
      return AuthResource.save({}, {"username": username, "password": password}, successCb, failCb);
    },

    changePassword: function(userId, currentPassword, newPassword, token, successCb, failCb){
      return AuthResource.update({userId: userId, t: token}, {currentPassword: currentPassword, newPassword: newPassword}, successCb, failCb);
    }
  };
}]);
