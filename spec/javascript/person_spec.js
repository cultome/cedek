var common = require('./spec_helper.js');

describe("Person", function(){
  beforeEach(function(){
    common.goHome();
  });

  it("creates a new person", function(){
    var before = common.countPeopleListed();
    common.createStudent("Alfredo Alvarado");
    var students = element.all(by.repeater("student in students | filter:name"));
    var after = common.countPeopleListed();
    expect(students.count()).toBeGreaterThan(before);
  });

  it("updates person information", function(){
    common.createStudent("Mama Lucha");
    common.selectLastPerson().element(by.css(".go-to-edit")).click();
    // limpiamos los campos
    element(by.model("student.name")).clear();
    element(by.model("student.address")).clear();
    element(by.model("student.email")).clear();
    element(by.model("student.job")).clear();
    // actualizamos los datos
    element(by.model("student.name")).sendKeys("Rosanelda Resendiz");
    element(by.model("student.job")).sendKeys("Vendedora de Garnachas");
    element(by.model("student.marital_status_id")).sendKeys("viud");
    element(by.model("student.birthday")).sendKeys("12311980");
    element(by.model("student.address")).sendKeys("Insurgentes Sur 9300");
    element(by.model("student.email")).sendKeys("rosanelda@gmail.com");
    element(by.id("updatePersonBtn")).click();
    // checamos la actualizacion
    common.selectLastPerson().element(by.css(".go-to-edit")).click();
    expect(element(by.model("student.name")).getAttribute("value")).toEqual("Rosanelda Resendiz");
    expect(element(by.model("student.address")).getAttribute("value")).toEqual("Insurgentes Sur 9300");
    expect(element(by.model("student.email")).getAttribute("value")).toEqual("rosanelda@gmail.com");
    expect(element(by.model("student.birthday")).getAttribute("value")).toEqual("1980-12-31");
    expect(element(by.model("student.job")).getAttribute("value")).toEqual("Vendedora de Garnachas");
    expect(element(by.model("student.marital_status_id")).getAttribute("value")).toEqual("3");
  });
});
