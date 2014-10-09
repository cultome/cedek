exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['user_spec.js'],
  //specs: ['user_spec.js', 'course_spec.js', 'person_spec.js'],
  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': {
      //'args': ['--disable-web-security']
    }
  }
}
