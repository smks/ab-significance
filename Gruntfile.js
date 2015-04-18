'use strict';
module.exports = function (grunt) {
    // Load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // Show elapsed time at the end
    require('time-grunt')(grunt);

    grunt.loadNpmTasks('grunt-jquery-json');

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed MIT */\n',
        // Task configuration.
        clean: {
            files: ['dist']
        },
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: ['src/<%= pkg.name %>.js'],
                dest: 'dist/jquery.<%= pkg.name %>.js'
            }
        },
        jquerymanifest: {
            options: {
                source: grunt.file.readJSON('package.json'),
                overrides: {
                    name: "abSignificance",
                    title: "jquery.abSignificance",
                    author: {
                        name: "Shaun Michael K. Stone",
                        email: "shaunmstone@gmail.com",
                        url: "http://www.smks.co.uk"
                    },
                    homepage: "https://github.com/SMKS/ab-significance",
                    demo: "https://github.com/SMKS/ab-significance"
                }
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: 'dist/jquery.<%= pkg.name %>.min.js'
            }
        },
        qunit: {
            all: {
                options: {
                    urls: ['http://localhost:9000/test/<%= pkg.name %>.html']
                }
            }
        },
        jshint: {
            options: {
                reporter: require('jshint-stylish')
            },
            gruntfile: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: 'Gruntfile.js'
            },
            src: {
                options: {
                    jshintrc: 'src/.jshintrc'
                },
                src: ['src/**/*.js']
            },
            test: {
                options: {
                    jshintrc: 'test/.jshintrc'
                },
                src: ['test/**/*.js']
            }
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            src: {
                files: '<%= jshint.src.src %>',
                tasks: ['jshint:src', 'qunit']
            },
            test: {
                files: '<%= jshint.test.src %>',
                tasks: ['jshint:test', 'qunit']
            }
        },
        connect: {
            server: {
                options: {
                    hostname: '*',
                    port: 9000
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-jquerymanifest');

    // Default task.
    grunt.registerTask('default', ['jshint', 'connect', 'qunit', 'clean', 'concat', 'uglify', 'jquerymanifest']);
    grunt.registerTask('server', function () {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run(['serve']);
    });
    grunt.registerTask('serve', ['connect', 'watch']);
    grunt.registerTask('test', ['jshint', 'connect', 'qunit']);
};
