var common = require('./spec_helper.js');

describe('User', function(){
  beforeEach(function(){
    common.goHome();
    common.login("admin", "admin");
  });

  describe("creating", function(){
    it('a new user', function(){
      var before = common.countUsersListed();
      common.createUser("juan", "Juan Pecas", "Regular");
      browser.sleep(2000); // esperamos a que la alerta se desvanezca
      var after = common.countUsersListed();
      expect(after).toBeGreaterThan(before);
    });
  });

  describe("updating", function(){
    it('a user information', function(){
      var before = common.countUsersListed();
      common.createUser("pepe", "Pepe Power", "Administrador");
      browser.sleep(2000); // esperamos a que la alerta se desvanezca
      var after = common.countUsersListed();
      expect(after).toBeGreaterThan(before);
      common.selectLastUser().element(by.css(".go-to-edit")).click();
      // checamos los datos antes del cambio
      element(by.model("user.username")).getAttribute("value").toEqual("pepe");
      element(by.model("user.name")).getAttribute("value").toEqual("Pepe Power");
      element(by.model("user.user_type_id")).getAttribute("value").toEqual("1");
      // limiamos
      element(by.model("user.username")).clear();
      element(by.model("user.name")).clear();
      // actualizamos
      element(by.model("user.username")).sendKeys("pechus");
      element(by.model("user.name")).sendKeys("Jose Anaya");
      element(by.model("user.user_type_id")).sendKeys("Regular");
      element(by.model("user.currentPassword")).sendKeys("password");
      element(by.id("updateUserbtn")).click();
      // checamos la actualizacion
      common.selectLastUser().element(by.css(".go-to-edit")).click();
      element(by.model("user.username")).getAttribute("value").toEqual("pechus");
      element(by.model("user.name")).getAttribute("value").toEqual("Jose Anaya");
      element(by.model("user.user_type_id")).getAttribute("value").toEqual("2");
    });
  });
});

