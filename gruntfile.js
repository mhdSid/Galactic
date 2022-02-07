module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    ts: {
      options: {
        // Generates corresponding .map file.
        sourceMap: false,

        // Generates corresponding .d.ts file.
        declaration: false,

        // Do not emit comments to output.
        removeComments: false,

        // Warn on expressions and declarations with an implied 'any' type.
        noImplicitAny: false,

        // Skip resolution and preprocessing.
        noResolve: false,

        // Specify module code generation: 'commonjs' or 'amd'
        module: 'amd',

        // Specify ECMAScript target version: 'ES3' (default), or 'ES5'
        target: 'ES5',

        //basePath: ['assets/**/*.ts', 'views/**/*.ts']

        // noLib: true,

        // target: 'es5', //or es3

        // module: 'amd', //or commonjs

        // sourceMap: true,

        // declaration: true,

        // removeComments: false,

        // noImplicitAny: true, //warn on 'any' declaration

        // basePath: 'path/to/typescript/files',

        // noResolve: false,

        // preserveConstEnums: true,

        noEmitOnError: false,

        // suppressImplicitAnyIndexErrors: true,

        // experimentalDecorators: false,

        // emitDecoratorMetadata: false,

        // newLine: '',

        // inlineSourceMap: false,

        // inlineSources: true,

        // noEmitHelpers: true

        fast: 'always',
        failOnTypeErrors: false,

        compile: true
      },
      dev: {
        src: 'Galactic.ts',
        outDir: ''
      }
    },

    uglify: {
      initial_target: {
        options: {
          reserveDOMProperties: true,
          mangle: true,
          sourceMap: true,
          preserveComments: false,
          beautify: true,
          compress: {
            drop_console: true
          },
          expand: true, // allow dynamic building
          flatten: true, // remove all unnecessary nesting
          maxLineLen: 9999999
        },
        files: {
          'Galactic.min.js':  'Galactic.js'
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', ['ts', 'uglify']);
};
