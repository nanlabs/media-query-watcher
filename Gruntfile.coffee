module.exports = (grunt) ->
	## Show elapsed time at the end
	require('time-grunt')(grunt)

	serverPort = 9000
	livereloadPort = 35729

	## Project configuration.
	grunt.initConfig
	## Metadata.
		pkg: grunt.file.readJSON 'package.json'

		OUTPUT_JS: 'xteam.<%= pkg.name%>'
		banner: '/*! <%= pkg.name %> - v<%=pkg.version%> - ' +
		'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
		'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
		'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;*/\n'

	## Task configuration.
		clean:
			dist: ['dist']
			tmp: ['tmp']

		notify:
			server: options: { message: 'Server running' }
			test: options: { message: 'Tests passed successfully' }
			build: options: { message: 'Build Complete' }

		browserify:
			errorLogger:
				src: 'src/js/error-logger.js'
				dest: 'dist/xteam.errorlogger.js'
				options:
					alias: ['node_modules/resig-class/index.js:class']
			src:
				src: 'src/js/jquery-plugin-wrapper.js'
				dest: 'dist/<%= OUTPUT_JS %>.js'
				options:
					alias: ['src/js/jquery.shim.js:jquery', 'node_modules/resig-class/index.js:class']
					debug: true
			test:
				src: 'test/automated/**/*.js'
				dest: 'tmp/automated-tests.js'
				options:
					alias: ['src/js/jquery.shim.js:jquery', 'node_modules/resig-class/index.js:class']
					debug: true

		less:
			dist:
				options:
					yuicompress: true
				files:
					'dist/<%= OUTPUT_JS %>.min.css': 'src/less/style.less'
					'dist/<%= OUTPUT_JS %>-fox.min.css': 'src/less/style-fox.less'

		uglify:
			options:
				banner: '<%= banner %>'
			dist:
				files:
					'dist/<%= OUTPUT_JS %>.min.js':'dist/<%= OUTPUT_JS %>.js'
					'dist/xteam.errorlogger.min.js':'dist/xteam.errorlogger.js'

	## Automated testing
		testem:
			main:
				options:
					before_tests: 'grunt compile'
					src_files: ['<%= jshint.src.src %>', 'test/automated/**/*']
				## parallel: 8,
					test_page: 'test/automated/runner.html',
					launch_in_ci: ['PhantomJS'],
					launch_in_dev: ['Chrome', 'PhantomJS']
		
		## Automated testing
		mocha:
			automated: [ 'test/automated/runner.html' ]
			options:
				bail: false ## Bail means if a test fails, grunt will abort. False by default.
				log: false ## To enable logs while testing
				reporter: 'Spec'

		jshint:
			src:
				options: { jshintrc: 'src/.jshintrc' }
				src: 'src/js/**/*.js'
			test:
				options: { jshintrc: 'test/.jshintrc' }
				src: 'test/automated/**/*.js'

		watch:
			options:
				livereload:
					port: livereloadPort
				spawn: false
			src:
				files: '<%= jshint.src.src %>'
				tasks: ['jshint:src', 'browserify', 'mocha']
				options:
					spawn: true
			automatedtest:
				files: 'test/automated/**/*'
				tasks: ['jshint:test', 'browserify:test', 'mocha', 'notify:test']
			dev:
				files: 'test/dev/*'

		copy:
			demo:
				files: [
					{expand: true, flatten: true, src: ['test/demo/index.html', 'test/dev/data.json', 'bower_components/jquery/jquery.min.js'], dest: 'dist/demo', filter: 'isFile'}, ## includes files in path
				]
			less:
				files: [
					{expand: true, flatten: true, src: ['src/less/*'], dest: 'dist/less'}
				]

		connect:
			options:
				hostname: '*'
				port: serverPort
			dev:
				options:
					port: serverPort
			demo:
				options:
					keepalive: true

		open:
			dev:
				path: "http://localhost:#{serverPort}/test/dev"
			demo:
				path: "http://localhost:#{serverPort}/dist/demo"

	## These plugins provide necessary tasks.
	grunt.loadNpmTasks 'grunt-contrib-clean'
	grunt.loadNpmTasks 'grunt-contrib-copy'
	grunt.loadNpmTasks 'grunt-contrib-less'
	grunt.loadNpmTasks 'grunt-contrib-uglify'
	grunt.loadNpmTasks 'grunt-contrib-jshint'
	grunt.loadNpmTasks 'grunt-contrib-watch'
	grunt.loadNpmTasks 'grunt-contrib-connect'
	grunt.loadNpmTasks 'grunt-notify'
	grunt.loadNpmTasks 'grunt-browserify'
	grunt.loadNpmTasks 'grunt-open'

	## Used for automated testing
	grunt.loadNpmTasks 'grunt-contrib-testem'
	grunt.loadNpmTasks 'grunt-mocha'

	## Default task.
	grunt.registerTask 'compile', ['clean', 'jshint', 'browserify']
	grunt.registerTask 'test', ['testem:run:main', 'notify:test']
	grunt.registerTask 'build', ['less', 'uglify', 'copy:less', 'notify:build']
	grunt.registerTask 'default', ['test', 'build', 'clean:tmp']
	grunt.registerTask 'dev', ['compile', 'connect:dev', 'notify:server', 'open:dev', 'watch']
	grunt.registerTask 'demo',
		['compile', 'build', 'copy:demo', 'clean:tmp', 'notify:server', 'open:demo', 'connect:demo']