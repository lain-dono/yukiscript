module.exports = function(grunt) {
    var metaFile = grunt.file.read('yukiscript.meta.js');

    var srcFiles = [
        'src/intro.js',
        'src/utils.js',
        'src/yukiscript.js',
        'src/reversi.js',
        'src/main.js',
        'src/outro.js'
    ];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                banner: metaFile,
            },
            dist: {
                src: srcFiles,
                dest: 'yukiscript.user.js',
            },
        },
        jsbeautifier: {
            files: srcFiles,
        },
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-jsbeautifier');

    grunt.registerTask('default', ['concat']);
};
