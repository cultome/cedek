describe('Course', function(){
  var menuOptions = element.all(by.css(".dropdown"));
  var courseMenu = menuOptions.last();
  var peopleMenu = menuOptions.first();

  beforeEach(function(){
    browser.get("http://localhost:92/app/");
  });

  describe("creating", function(){
    it('creates a new course', function(){
      var before = countCoursesListed();
      createCourse("Homeopatia");
      var after = countCoursesListed();
      expect(after).toBeGreaterThan(before);
    });

    it("enroll student", function(){
      createStudent("Susana Alvarado");
      createCourse("Hipnosis");

      var beforeCount = element(by.id("enrolledStudentsCount")).getText();
      var beforeStudents = element.all(by.repeater("student in students")).count();

      element.all(by.css(".students-panel")).last().element(by.cssContainingText("option", "Susana Alvarado")).click();
      element(by.id("enrollBtn")).click();

      var afterCount = element(by.id("enrolledStudentsCount")).getText();
      var afterStudents = element.all(by.repeater("student in students")).count();

      expect(afterCount).toBeGreaterThan(beforeCount);
      expect(afterStudents).toBeGreaterThan(beforeStudents);
    });

    it("give scholarship", function(){
      createStudent("Noel Soria");
      createCourse("Astrologia");

      var beforeCount = element(by.id("courseScholarshipsCount")).getText();
      var beforeStudents = element.all(by.repeater("scholarship in scholarships")).count();

      element.all(by.css(".scholarship-panel")).last().element(by.cssContainingText("option", "Noel Soria")).click();
      element(by.model("panels.scholarship.amount")).sendKeys("50");
      element(by.id("giveScholarshipBtn")).click();

      var afterCount = element(by.id("courseScholarshipsCount")).getText();
      var afterStudents = element.all(by.repeater("scholarship in scholarships")).count();

      expect(afterCount).toBeGreaterThan(beforeCount);
      expect(afterStudents).toBeGreaterThan(beforeStudents);
    });

    it("check attendance", function(){
      createStudent("Carlos Soria");
      createCourse("Introduccion a la Mediumnidad");
      // nos inscribimos al curso
      element.all(by.css(".students-panel")).last().element(by.cssContainingText("option", "Carlos Soria")).click();
      element(by.id("enrollBtn")).click();
      // vamos a los detalles del curso
      element(by.id("goToDetailsBtn")).click();
      // pnemos asistencia
      element.all(by.css(".attendance-btn")).first().click();
      // volvemos a la pagina de detalles y buscamos las sistencias
      var course = selectLastCourse();
      course.all(by.tagName("span")).first().click();
      element(by.model("attendanceDate")).all(by.tagName("option")).last().click();
      element(by.id("getAttendanceBtn")).click();
      var count = element(by.css(".searchAttendance-panel")).all(by.repeater("student in students")).count();
      browser.sleep(3000);
      expect(count).toBeGreaterThan(0);
    });
  });

  describe("listing", function(){
    it("all courses", function(){
      createCourse("Esperanto");
      expect(countCoursesListed()).not.toEqual(0);
    });

    it("show enrolled students", function(){
      createCourse("Curso I");
      var course = selectLastCourse();
      expect(element(by.css(".students-panel")).getCssValue("display")).toEqual("none");
      course.element(by.css(".courseStudents-btn")).click();
      expect(element(by.css(".students-panel")).getCssValue("display")).not.toEqual("none");
    });

    it("show attendance", function(){
      createCourse("Psicologia");
      var course = selectLastCourse();
      expect(element(by.css(".attendance-panel")).getCssValue("display")).toEqual("none");
      course.element(by.css(".attendance-btn")).click();
      expect(element(by.css(".attendance-panel")).getCssValue("display")).not.toEqual("none");
    });

    it("send to details", function(){
      createCourse("Taller de Homeopatia");
      var course = selectLastCourse();
      course.element(by.css(".courseDetails-btn")).click();
      expect(element(by.css(".studentListFullOpc")).isPresent()).toBe(true);
    });
  });


  /*
   * Utilitarios
   */
  function createStudent(studentName){
    var before = countPeopleListed();
    goTo("addPeople");
    element(by.model("student.name")).sendKeys(studentName);
    element(by.model("student.birthday")).sendKeys("06112008");
    element(by.model("student.address")).sendKeys("Av. del Pirul 365, Xochimilco, D.F.");
    element(by.model("student.email")).sendKeys("salsero2008@gmail.com");
    element(by.id("createPersonBtn")).click();
    expect(element(by.id("buscarPersonas")).isPresent()).toBe(true);
    var students = element.all(by.repeater("student in students | filter:name"));
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
    element(by.model("course.cost")).sendKeys("60");
    element(by.model("course.hour")).sendKeys("1800");
    element(by.model("course.begin")).sendKeys("01012014");
    element(by.model("course.end")).sendKeys("12312014");
    switch(new Date().getDay()){
      case 0:
        element(by.cssContainingText("option", "Domingo")).click();
        element(by.model("course.code")).sendKeys("CUR-DOM");
        break;
      case 1:
        element(by.cssContainingText("option", "Lunes")).click();
        element(by.model("course.code")).sendKeys("CUR-LUN");
        break;
      case 2:
        element(by.cssContainingText("option", "Martes")).click();
        element(by.model("course.code")).sendKeys("CUR-MAR");
        break;
      case 3:
        element(by.cssContainingText("option", "Miercoles")).click();
        element(by.model("course.code")).sendKeys("CUR-MIE");
        break;
      case 4:
        element(by.cssContainingText("option", "Jueves")).click();
        element(by.model("course.code")).sendKeys("CUR-JUE");
        break;
      case 5:
        element(by.cssContainingText("option", "Viernes")).click();
        element(by.model("course.code")).sendKeys("CUR-VIE");
        break;
      case 6:
        element(by.cssContainingText("option", "Sabado")).click();
        element(by.model("course.code")).sendKeys("CUR-SAB");
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
});
