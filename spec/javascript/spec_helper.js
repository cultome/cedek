var menuOptions = element.all(by.css(".dropdown"));
var courseMenu = menuOptions.last();
var peopleMenu = menuOptions.first();

function goHome(){
  browser.get("http://localhost:92/app/");
}

function goTo(option){
  if("addCourse" === option){
    courseMenu.click();
    courseMenu.element(by.id("addCourseOpt")).click();
  } else if("listCourse" === option){
    courseMenu.click();
    courseMenu.element(by.id("listCourseOpt")).click();
  } else if("addPeople" === option){
    peopleMenu.click();
    peopleMenu.element(by.id("addPeopleOpt")).click();
  } else if("listPeople" === option){
    peopleMenu.click();
    peopleMenu.element(by.id("listPeopleOpt")).click();
  }
}

function createStudent(studentName){
  goTo("addPeople");
  element(by.model("student.name")).sendKeys(studentName);
  element(by.model("student.birthday")).sendKeys("06112008");
  element(by.model("student.address")).sendKeys("Av. del Pirul 365, Xochimilco, D.F.");
  element(by.model("student.email")).sendKeys("salsero2008@gmail.com");
  element(by.id("createPersonBtn")).click();
  expect(element(by.id("buscarPersonas")).isPresent()).toBe(true);
}

function selectLastCourse(){
  goTo("listCourse");
  var course = element.all(by.repeater("course in courses | filter:name")).last();
  course.element(by.css(".panel-heading")).click();
  return course;
}

function selectLastPerson(){
  goTo("listPeople");
  var student = element.all(by.repeater("student in students | filter:name")).last();
  student.element(by.css(".panel-heading")).click();
  return student;
}

function countPeopleListed(){
  goTo("listPeople");
  return element.all(by.repeater("student in students | filter:name")).count();
}

function countCoursesListed(){
  goTo("listCourse");
  return element.all(by.repeater("course in courses | filter:name")).count();
}

function createCourse(courseName){
  goTo("addCourse");
  // llenamos el fornulario
  element(by.model("course.name")).sendKeys(courseName);
  element(by.model("course.cost")).sendKeys("60");
  element(by.model("course.hour")).sendKeys("1800");
  element(by.model("course.begin")).sendKeys("01012014");
  element(by.model("course.end")).sendKeys("12312014");
  var prefix = courseName.substring(0,3).toUpperCase();
  switch(new Date().getDay()){
    case 0:
      element(by.cssContainingText("option", "Domingo")).click();
      element(by.model("course.code")).sendKeys(prefix + "-DOM");
      break;
    case 1:
      element(by.cssContainingText("option", "Lunes")).click();
      element(by.model("course.code")).sendKeys(prefix + "-LUN");
      break;
    case 2:
      element(by.cssContainingText("option", "Martes")).click();
      element(by.model("course.code")).sendKeys(prefix + "-MAR");
      break;
    case 3:
      element(by.cssContainingText("option", "Miercoles")).click();
      element(by.model("course.code")).sendKeys(prefix + "-MIE");
      break;
    case 4:
      element(by.cssContainingText("option", "Jueves")).click();
      element(by.model("course.code")).sendKeys(prefix + "-JUE");
      break;
    case 5:
      element(by.cssContainingText("option", "Viernes")).click();
      element(by.model("course.code")).sendKeys(prefix + "-VIE");
      break;
    case 6:
      element(by.cssContainingText("option", "Sabado")).click();
      element(by.model("course.code")).sendKeys(prefix + "-SAB");
      break;
  }
  element(by.css(".btn-block")).click();
  // checamos que se haya actualizado la pagina
  expect(element.all(by.css(".attendance-panel")).first().getText()).toEqual("Asistencia");
  expect(element.all(by.css(".scholarship-panel")).first().getText()).toEqual("Becas");
  expect(element.all(by.css(".students-panel")).first().getText()).toEqual("Estudiantes");
  //expect(element.all(by.css(".pendingPayments-panel")).first().getText()).toEqual("Pagos Pendientes");

  // checamos que los datos del curso sean los esperados
  expect(element(by.model("course.name")).getAttribute("value"), "Homeopatia");
  expect(element(by.model("course.code")).getAttribute("value"), "HOM-JU");
  expect(element(by.model("course.cost")).getAttribute("value"), "60");
  expect(element(by.model("course.day")).getAttribute("value"), "Jueves");
  expect(element(by.model("course.hour")).getAttribute("value"), "1800");
  expect(element(by.model("course.begin")).getAttribute("value"), "01012014");
  expect(element(by.model("course.end")).getAttribute("value"), "12312014");
}

// variables
exports.menuOptions = menuOptions;
exports.courseMenu = courseMenu;
exports.peopleMenu = peopleMenu;
//functions
exports.createStudent = createStudent;
exports.createCourse = createCourse;
exports.countCoursesListed = countCoursesListed;
exports.countPeopleListed = countPeopleListed;
exports.selectLastCourse = selectLastCourse;
exports.selectLastPerson = selectLastPerson;
exports.goHome = goHome;
