describe('Course', function(){
  var courseMenu = element.all(by.css(".dropdown")).last();

  beforeEach(function(){
    browser.get("http://localhost:92/app/");
  });

  it('creates a new course', function(){
    // seleccionamos del menu la opcion
    courseMenu.click();
    courseMenu.all(by.tagName("a")).last().click();
    // llenamos el fornulario
    element(by.model("course.name")).sendKeys("Homeopatia");
    element(by.model("course.code")).sendKeys("HOM-JU");
    element(by.model("course.cost")).sendKeys("60");
    element(by.cssContainingText("option", "Jueves")).click();
    element(by.model("course.hour")).sendKeys("1800");
    element(by.model("course.begin")).sendKeys("01012014");
    element(by.model("course.end")).sendKeys("12312014");
    element(by.css(".btn-block")).click();
    // checamos que se haya actualizado la pagina
    expect(element.all(by.css(".panel-title")).last().getText()).toEqual("Asistencia");
  });
});
