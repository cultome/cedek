module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        stripBanners: true,
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */',
      },
      dist: {
        src: [
          'app/js/app.js',
          'app/js/course_ctrl.js',
          'app/js/user_ctrl.js',
          'app/js/people_ctrl.js',
          'app/js/consult_ctrl.js',
          'app/js/admin_ctrl.js',
          'app/js/directives.js',
          'app/js/service.js'
        ],
        dest: 'build/cedek.js',
      }
    },

    jshint: {
      src: ['app/js/*.js'],
      concat: ['build/cedek.js'],
      options: {
        "node": true,
        "esnext": true,
        "bitwise": false,
        "curly": false,
        "eqeqeq": true,
        "eqnull": true,
        "immed": true,
        "latedef": false,
        "newcap": true,
        "noarg": true,
        "undef": true,
        "strict": true,
        "trailing": true,
        "smarttabs": true,
        globals: {
          'angular': true,
          '$': true,
          'document': true,
          'gnMenu': true
        }
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        files: {
          'public/js/cedek.min.js': ['build/cedek.js']
        }
      }
    },

    cssmin: {
      minify: {
        files: {
          'public/css/cedek.min.css': ['app/css/app.css']
        }
      }
    },

    html2js: {
      options: {
        base: 'app/pages/',
        module: 'templates',
        singleModule: true,
        htmlmin: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          removeComments: true,
          removeEmptyAttributes: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true
        }
      },
      main: {
        src: ['app/pages/**/*.html'],
        dest: 'public/js/templates.js'
      },
    },


    copy: {
      statics: {
        files: [
          {
            expand: true, cwd: 'app/',
            src: [
              'img/**',
            ],
            dest: 'public/'
          },
          {
            expand: true, cwd: 'node_modules/bootstrap/',
            src: [
              'fonts/*'
            ],
            dest: 'public/',
          },
          {
            expand: true, cwd: 'node_modules/',
            src: [
              'jquery/dist/jquery.min.js',
              'jquery/dist/jquery.min.map',
              'angular/angular.min.js',
              'angular/angular.min.js.map',
              'angular-route/angular-route.min.js',
              'angular-route/angular-route.min.js.map',
              'angular-resource/angular-resource.min.js',
              'angular-resource/angular-resource.min.js.map',
              'angular-sanitize/angular-sanitize.min.js',
              'angular-sanitize/angular-sanitize.min.js.map',
              'notifyjs-browser/dist/notify.js',
              'bootstrap/dist/js/bootstrap.min.js',
              'bootstrap/dist/css/bootstrap.min.css',
            ],
            dest: 'public/lib',
            flatten: true
          }
        ],
      },
      dynamics: {
        files: [
          {
            expand: true, cwd: 'app/',
            src: ['*.html'],
            dest: 'public/',
          }
        ],

        options: {
          process: function(content, srcpath){
            if(srcpath.match("index.html$")){
              grunt.log.writeln("Modificando los imports de js en " + srcpath);
              var retVal = content;
              // eliminamos los imports de nuestros js
              retVal = retVal.replace(/<script type="text\/javascript" src="js\/([\w\/]+?).js"><\/script>/g, "");
              // eliminamos los imports de nuestros css
              retVal = retVal.replace(/<link rel="stylesheet" type="text\/css" href="css\/([\w]+?).css"\/>/g, "");
              // sustituimos los comentarios por imports
              retVal = retVal.replace(/<!-- cedek.min.js -->/g, "<script type=\"text/javascript\" src=\"js/cedek.min.js\"></script>");
              retVal = retVal.replace(/<!-- templates.js -->/g, "<script type=\"text/javascript\" src=\"js/templates.js\"></script>");
              retVal = retVal.replace(/<!-- cedek.min.css -->/g, "<link rel=\"stylesheet\" type=\"text/css\" href=\"css/cedek.min.css\"/>");

              // cambiamos a las versiones minimizadas de las librerias de tercero
              retVal = retVal.replace(/..\/node_modules\/bootstrap\/dist\/css\/bootstrap.min.css/g, "lib\/bootstrap.min.css");

              retVal = retVal.replace(/lib\/(([\w-_ ]+)\/)+/g, "lib\/"); // movemos el path de las librerias de tercero desde app a lib

              retVal = retVal.replace(/..\/node_modules\/angular\/angular.min.js/g, "lib\/angular.min.js");
              retVal = retVal.replace(/..\/node_modules\/angular-route\/angular-route.min.js/g, "lib\/angular-route.min.js");
              retVal = retVal.replace(/..\/node_modules\/angular-resource\/angular-resource.min.js/g, "lib\/angular-resource.min.js");
              retVal = retVal.replace(/..\/node_modules\/angular-sanitize\/angular-sanitize.min.js/g, "lib\/angular-sanitize.min.js");
              retVal = retVal.replace(/..\/node_modules\/jquery\/dist\/jquery.min.js/g, "lib\/jquery.min.js");
              retVal = retVal.replace(/..\/node_modules\/bootstrap\/dist\/js\/bootstrap.min.js/g, "lib\/bootstrap.min.js");
              retVal = retVal.replace(/..\/node_modules\/notifyjs-browser\/dist\/notify.js/g, "lib\/notify.js");

              return retVal;
            } else {
              return content;
            }
          }
        }
      },

      substitutePaths: {
        src: 'build/cedek.js',
        dest: 'build/cedek.js',
        options: {
          process: function(content, srcpath){
            return content.replace(/\/\/,'templates'/, ",'templates'").replace(/pages\//g, "");
          }
        }
      }
    },

    clean: {
      all: {
        src: ["build", "public"]
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');

  // Tasks
  grunt.registerTask('resources', ['copy:statics', 'copy:dynamics', 'concat', 'copy:substitutePaths', 'cssmin', 'uglify']);
  grunt.registerTask('default', ['clean:all', 'jshint:src', 'resources', 'jshint:concat', 'html2js:main']);

};
