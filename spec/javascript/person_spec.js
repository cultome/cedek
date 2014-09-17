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
});
