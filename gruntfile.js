module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		homemade: {
			jquery:{
				src: "build/build.jquery.js",
				dest: "dist/jquery.<%= pkg.name %>.js",
				context: {
					pluginName: "cpickr" 
				}
			},
			vanilla:{
				src: "build/build.vanilla.js",
				dest: "dist/<%= pkg.name %>.js",
				context: {
					pluginName: "cpickr" 
				}
			}
		},

		jshint: {
			// define the files to lint
			files: ['gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
			// configure JSHint (documented at http://www.jshint.com/docs/)
			options: {
				// more options here if you want to override JSHint defaults
				globals: {
					jQuery: true,
					console: true,
					module: true
				},
				strict: false
			}
		},

		concat: {
			options: {
				separator: ';'
			},
			dist: {
				src: ['src/utils.js', 'src/slide-area.js'],
				dest: 'dist/<%= pkg.name %>.js'
			},
		},

		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			dist: {
				files: {
					'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
				}
			}
		},

		qunit: {
			files: ['test/**/*.html']
		},

		watch: {
			files: ['<%= jshint.files %>'],
			tasks: ['jshint', 'qunit']
		},
	});

	//load tasks
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks("grunt-homemade");

	//register tasks
	grunt.registerTask('test', ['jshint', 'qunit']);
	grunt.registerTask('default', ['jshint', 'homemade']);

};