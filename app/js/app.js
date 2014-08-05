/* jshint strict: true */

angular.module('CEDEK', [
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
      "hasScholarship": false,
      "scholarshipPercent": 0,
      "phones": [{
        "number": "",
        "type": 1
      }],
      "debts": null
    };
    $scope.phoneTypes = CatalogService.phoneTypes();

    $scope.getPhoneTypeName = function(id){
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
				$scope.studentsWithScholarship = PeopleService.getStudentsWithScholarship(courseId);
			};

			$scope.getStudentsWithPendingPayments = function(courseId){
				$scope.studentsWithPendingPayments = PeopleService.getStudentsWithPendingPayments(courseId);
			};

			$scope.initCourseList = function(){
				$scope.courses = CourseService.getCourses();
			};

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
app.factory('PeopleService', [function(){
	"use strict";

	return {
		listStudents: function(){
			return [
{
	"id": 1,
	// personales
	"name": "Susana Alvarado",
	"birthday": "1983-10-02",
	"address": "Av Iman 580, Coyoacan, DF",
	"email": "susana@gmail.com",
	"phones": [
{
	"number": "5607-4335",
	"type": 1
},
{
	"number": "5517-8390",
"type": 2
},
	],
	// extendidos
	"leadPrayGroup": true,
	"hasScholarship": true,
	"scholarshipPercentage": 10,
	// historial
	"previous": [
{"id": 1, "name": "Curso I"}
],
	"enrollments": [
{"id": 2, "name": "Curso II"}
],
	"reserves": [
{"id": 3, "name": "Curso III"},
{"id": 4, "name": "Curso IV"}
],
	"scholarships": [
{"id": 1, "percentage": 75, "courseId": 7, "courseName": "Biomagnetismo"}
],
	"debts": [
{"id": 1, "courseId": 2, "courseName": "Biomagnetismo", "amount": 145}
]
}
];
},

	// READY!
	getStudentsFromCourse: function(courseId){
		return [
		{
			"id": 1,
			"name": "Susana Alvarado"
		}
		];
	},

	// READY!
	getCourseStudent: function(courseId, personId){
		return {
			"id": 1,
			// personales
			"name": "Susana Alvarado",
			"birthday": "1983-10-02",
			"address": "Av Iman 580, Coyoacan, DF",
			"email": "susana@gmail.com",
			// historial
			"enrollments": [
			{"id": 2, "name": "Curso II"}
			],
				"scholarships": [
				{"id": 1, "percentage": 45, "courseId": 2, "courseName": "Biomagnetismo"}
			],
				"debts": [
				{"id": 1, "courseId": 2, "courseName": "Biomagnetismo", "amount": 145}
			],
				"unattendance": [
				{
					"id": 1,
					"label": "1 de julio 2014",
					"date": "1-7-2014"
				},
				{
					"id": 2,
					"label": "8 de julio 2014",
					"date": "8-7-2014"
				},
				]
		};
	},

	// READY!
	getStudent: function(personId){
		return {
			"id": 1,
			// personales
			"name": "Susana Alvarado",
			"birthday": "1983-10-02",
			"address": "Av Iman 580, Coyoacan, DF",
			"email": "susana@gmail.com",
			"phones": [
			{
				"number": "5607-4335",
				"type": 1
			},
			{
				"number": "5517-8390",
				"type": 2
			},
			],
			// extendidos
			"leadPrayGroup": true,
			"hasScholarship": true,
			"scholarshipPercentage": 10,
			// historial
			"previous": [
			{"id": 1, "name": "Curso I"}
			],
				"enrollments": [
				{"id": 2, "name": "Curso II"}
			],
				"reserves": [
				{"id": 3, "name": "Curso III"},
				{"id": 4, "name": "Curso IV"}
			],
				"scholarships": [
				{"id": 1, "percentage": 45, "courseId": 7, "courseName": "Biomagnetismo"},
				{"id": 1, "percentage": 30, "courseId": 8, "courseName": "Mecanica Cuantica"}
			],
				"debts": [
				{"id": 1, "courseId": 2, "courseName": "Biomagnetismo", "amount": 145}
			]
		};
	},

	// READY!
	getStudentsWithPendingPayments: function(courseId){
		return [
		{
			"id": 1,
			"name": "Susana Alvarado",
			"debt": 150,
			"debtPayDate": "20 de julio 2014"
		}
		];
	},

	// READY!
	getStudentsWithScholarship: function(courseId){
		return [
		{
			"id": 1,
			"name": "Susana Alvarado",
			"percentage": 90
		}
		];
	},
	};
}]);

app.factory('CatalogService', [function(){
	"use strict";

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
	"use strict";

	return {
		// READY!
		getCourse: function(id){
			return {
				"id": 1,
	"code": "HOM-JU",
	"name": "Homeopatia II",
	"begin": "2014-07-04",
	"end": "2015-01-23",
	"day": 3,
	"hour": "19:30",
	"students": [
{
	"id": 1,
	"name": "Susana Alvarado",
	"price": 80
},
{
	"id": 2,
	"name": "Alfredo Alvarado",
	"price": 250
}
]
};
},

	// READY!
	getCourseSessions: function(courseId){
		return [
		{
			"id": 1,
			"label": "1 de julio 2014",
			"date": "1-7-2014"
		},
		{
			"id": 2,
			"label": "8 de julio 2014",
			"date": "8-7-2014"
		},
		{
			"id": 3,
			"label": "15 de julio 2014",
			"date": "15-7-2014"
		}
		];
	},

	// READY!
	getCourses: function(){
		return [
		{
			"id": 1,
			"code": "HOM-JU",
			"name": "Homeopatia II",
			"begin": "4 de junio 2014",
			"end": "5 de enero 2015",
			"schedule": "Jueves 18:00"
		},
		{
			"id": 2,
			"code": "BIO-JU",
			"name": "Biomagnetismo",
			"begin": "23 de octubre 2014",
			"end": "5 de enero 2015",
			"schedule": "Jueves 18:00"
		}
		];
	},

	// READY!
	getOpenCourses: function(){
		return [
		{
			"id": 5,
			"status": "En Curso",
			"name": "Esperanto Avanzado"
		},
		{
			"id": 6,
			"status": "Abierto",
			"name": "Homeopatia II"
		},
		{
			"id": 7,
			"status": "Abierto",
			"name": "Taller Homeopatia"
		}
		];
	},

	// READY!
	getAttendance: function(courseId, date){
		return [
		{
			"id": 1,
			"name": "Susana Alvarado",
			"attend": true
		},
		{
			"id": 2,
			"name": "Carlos Soria",
			"attend": false
		},
		{
			"id": 2,
			"name": "Paloma Alvarado",
			"attend": true
		}
		];
	},
	};
}]);
