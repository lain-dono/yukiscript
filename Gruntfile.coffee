# :set sw=2 ts=2 et

module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")
    coffeelint:
      app: 'src/**/*.coffee',
    coffee:
      options:
        bare: true
      compile:
        files:
          'build/coffee.js': [
            'src/utils/*.coffee'
            'src/core/*.coffee'
            'src/modules/*.coffee'
            'src/main.coffee'
          ]
    concat:
      options:
        banner: grunt.file.read('src/banner.js')
      build:
        src: ['src/intro.js','build/coffee.js', 'src/outro.js']
        dest: 'yukiscript.user.js'
    watch:
        files: 'src/**/*'
        tasks: 'default'

  grunt.loadNpmTasks 'grunt-coffeelint'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks "grunt-contrib-concat"
  grunt.loadNpmTasks "grunt-contrib-watch"

  grunt.registerTask 'default', ['coffeelint', 'coffee', 'concat']

