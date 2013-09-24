module.exports = function(grunt) {
	var srcFiles = ['src/intro.js', 'src/utils.js', 'src/yukiscript.js', 'src/reversi.js', 'src/main.js', 'src/outro.js'],
		metaFile = grunt.file.read('yukiscript.meta.js');

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
		jsbeautifier : {
			files : srcFiles,
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-jsbeautifier');

	grunt.registerTask('default', ['concat']);
};
