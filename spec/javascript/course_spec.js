describe('Course', function(){
  var menuOptions = element.all(by.css(".dropdown"));
  var courseMenu = menuOptions.last();
  var peopleMenu = menuOptions.first();

  beforeEach(function(){
    browser.get("http://localhost:92/app/");
  });

  it('creates a new course', function(){
    var before = countCoursesListed();
    createCourse("Homeopatia");
    var after = countCoursesListed();
    expect(after).toBeGreaterThan(before);
  });

  describe("listing", function(){
    beforeEach(function(){
      createCourse("Esperanto");
    });

    it("all courses", function(){
      expect(countCoursesListed()).not.toEqual(0);
    });

    it("show enrolled students", function(){
      var course = selectLastCourse();
      expect(element(by.css(".students-panel")).getCssValue("display")).toEqual("none");
      course.element(by.css(".courseStudents-btn")).click();
      expect(element(by.css(".students-panel")).getCssValue("display")).not.toEqual("none");
    });

    it("show attendance", function(){
      var course = selectLastCourse();
      expect(element(by.css(".attendance-panel")).getCssValue("display")).toEqual("none");
      course.element(by.css(".attendance-btn")).click();
      expect(element(by.css(".attendance-panel")).getCssValue("display")).not.toEqual("none");
    });

    it("send to details", function(){
      var course = selectLastCourse();
      course.element(by.css(".courseDetails-btn")).click();
      expect(element(by.css(".studentListFullOpc")).isPresent()).toBe(true);
    });
  });
/*
  describe("details", function(){
    beforeEach(function(){
      // creamos un estudiante
      addStudent("Noel Soria");
      // creamos un curso y vamos a los detalles
      createCourse("Biomagnetismo");
      var course = selectLastCourse();
      course.element(by.css(".courseDetails-btn")).click();
    });

    it("", function(){
    });
  });
*/




  /*
   * Utilitarios
   */
  function addStudent(studentName){
    var before = countPeopleListed();
    goTo("addPeople");
    element(by.model("student.name")).sendKeys(studentName);
    element(by.model("student.birthday")).sendKeys("06112008");
    element(by.model("student.address")).sendKeys("Av. del Pirul 365, Xochimilco, D.F.");
    element(by.model("student.email")).sendKeys("salsero2008@gmail.com");
    element(by.id("createPersonBtn")).click();
    var students = element.all(by.repeater("student in students | filter:name"));
    expect(students.isPresent()).toBe(true);
    var after = countPeopleListed();
    expect(students.count()).toBeGreaterThan(before);
  }

  function selectLastCourse(){
    goTo("listCourse");
    var course = element.all(by.repeater("course in courses | filter:name")).last();
    course.element(by.css(".panel-heading")).click();
    return course;
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
    element(by.model("course.code")).sendKeys("HOM-JU");
    element(by.model("course.cost")).sendKeys("60");
    element(by.cssContainingText("option", "Jueves")).click();
    element(by.model("course.hour")).sendKeys("1800");
    element(by.model("course.begin")).sendKeys("01012014");
    element(by.model("course.end")).sendKeys("12312014");
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
});
