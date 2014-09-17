var common = require('./spec_helper.js');

describe('Course', function(){
  beforeEach(function(){
    common.goHome();
  });

  describe("creating", function(){
    it('creates a new course', function(){
      var before = common.countCoursesListed();
      common.createCourse("Homeopatia");
      var after = common.countCoursesListed();
      expect(after).toBeGreaterThan(before);
    });

    it("enroll student", function(){
      common.createStudent("Susana Alvarado");
      common.createCourse("Hipnosis");

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
      common.createStudent("Noel Soria");
      common.createCourse("Astrologia");

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
      common.createStudent("Carlos Soria");
      common.createCourse("Introduccion a la Mediumnidad");
      // nos inscribimos al curso
      element.all(by.css(".students-panel")).last().element(by.cssContainingText("option", "Carlos Soria")).click();
      element(by.id("enrollBtn")).click();
      // vamos a los detalles del curso
      element(by.id("goToDetailsBtn")).click();
      // pnemos asistencia
      element.all(by.css(".attendance-btn")).first().click();
      // volvemos a la pagina de detalles y buscamos las sistencias
      var course = common.selectLastCourse();
      course.all(by.tagName("span")).first().click();
      element(by.model("attendanceDate")).all(by.tagName("option")).last().click();
      element(by.id("getAttendanceBtn")).click();
      var count = element(by.css(".searchAttendance-panel")).all(by.repeater("student in students")).count();
      expect(count).toBeGreaterThan(0);
    });
  });

  describe("updating", function(){
    it("person information", function(){
      common.createCourse("Autoestima");
      common.selectLastCourse().element(by.css(".go-to-edit")).click();
      // limpiamos y actualizamos
      element(by.model("course.name")).clear();
      element(by.model("course.cost")).clear();
      element(by.model("course.code")).clear();

      element(by.model("course.name")).sendKeys("Curso Recuperacion V");
      element(by.model("course.cost")).sendKeys("300");
      element(by.cssContainingText("option", "Lunes")).click();
      element(by.model("course.code")).sendKeys("REC-LUN");
      element(by.model("course.hour")).sendKeys("1030A");
      element(by.model("course.begin")).sendKeys("03012010");
      element(by.model("course.end")).sendKeys("03032010");
      element(by.id("updateCourseBtn")).click();
      // checamos la actualizacion
      common.selectLastCourse().element(by.css(".go-to-edit")).click();
      expect(element(by.model("course.name")).getAttribute("value")).toEqual("Curso Recuperacion V");
      expect(element(by.model("course.cost")).getAttribute("value")).toEqual("300");
      //expect(element(by.cssContainingText("option", "Lunes")));
      expect(element(by.model("course.code")).getAttribute("value")).toEqual("REC-LUN");
      expect(element(by.model("course.hour")).getAttribute("value")).toEqual("10:30");
      expect(element(by.model("course.begin")).getAttribute("value")).toEqual("2010-03-01");
      expect(element(by.model("course.end")).getAttribute("value")).toEqual("2010-03-03");
    });
  });

  describe("listing", function(){
    it("all courses", function(){
      common.createCourse("Esperanto");
      expect(common.countCoursesListed()).not.toEqual(0);
    });

    it("show enrolled students", function(){
      common.createCourse("Curso I");
      var course = common.selectLastCourse();
      expect(element(by.css(".students-panel")).getCssValue("display")).toEqual("none");
      course.element(by.css(".courseStudents-btn")).click();
      expect(element(by.css(".students-panel")).getCssValue("display")).not.toEqual("none");
    });

    it("show attendance", function(){
      common.createCourse("Psicologia");
      var course = common.selectLastCourse();
      expect(element(by.css(".attendance-panel")).getCssValue("display")).toEqual("none");
      course.element(by.css(".attendance-btn")).click();
      expect(element(by.css(".attendance-panel")).getCssValue("display")).not.toEqual("none");
    });

    it("send to details", function(){
      common.createCourse("Taller de Homeopatia");
      var course = common.selectLastCourse();
      course.element(by.css(".courseDetails-btn")).click();
      expect(element(by.css(".studentListFullOpc")).isPresent()).toBe(true);
    });
  });
});
