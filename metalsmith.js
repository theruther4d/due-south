var Metalsmith  = require('metalsmith');
var changed     = require('metalsmith-changed');
var inPlace     = require('metalsmith-in-place');
var layouts     = require('metalsmith-layouts');
var collections = require('metalsmith-collections');
var Handlebars  = require('handlebars');
var markdown    = require('metalsmith-markdown')
var prismic     = require('metalsmith-prismic');
var sass        = require('metalsmith-sass');
var imagemin    = require('metalsmith-imagemin');
var webpack     = require('metalsmith-webpack');
var optimize    = require('webpack').optimize;
var permalinks  = require('metalsmith-permalinks');
var path        = require('path');
var fs          = require('fs');

var myLinkResolver = function() {
    return '/<document.type>/<document.slug>';
}

// Debug Helper. Type {{ debug }} to log current context.
Handlebars.registerHelper("debug", function(optionalValue) {
  // console.log("Current Context");
  console.log("====================");
  // console.log(this);
  if (optionalValue) {
    // console.log("Value");
    console.log(optionalValue);
    console.log("====================");
  }
});

Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {

    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});

// If there's a prismic config use it.
// Otherwise, run the build without it but show a notice.
// try {
//   var prismicConfig = JSON.parse(fs.readFileSync('./prismic-config.json'));
//   var prismicTask   = prismic(prismicConfig);
// } catch(err) {
//   var prismicTask = function() {
//     console.log( 'error: ', err );
//     console.log('Note: Create a prismic-config.json to start pulling content from your Prismic.io repository.');
//   };
// }

var prismicConfig = {
    url: "https://due-south.prismic.io/api",
    linkResolver: function( ctx, doc ) {
        return '/' + doc.type + '/' + doc.slug + '/index.html';
    }
};

var prismicTask = prismic( prismicConfig );

var webpackConfig = {
  context: path.resolve(__dirname, './src/js/'),
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, './dist/js/'),
    filename: 'bundle.js'
  },
  plugins: [
    new optimize.UglifyJsPlugin({
      comments: /^remove all comments$/,
      mangle: true
    })
  ]
};

module.exports = function metalSmith(done) {
  Metalsmith(__dirname)
    .clean(false)
    .use(changed())
    .use(prismicTask)
    .use(webpack(webpackConfig))
    .use(inPlace({
      engine: 'handlebars',
      partials: 'templates/partials',
      pattern: '**/*.md'
    }))
    .use(markdown())
    .use(collections({
      pages: {
        pattern: 'src/pages/*.md'
      }
    }))
    .use(layouts({
      engine: 'handlebars',
      directory: 'templates/layouts',
      partials: 'templates/partials'
    }))
    .use(permalinks({
      pattern: ':title'
    }))
    .use(sass({
      outputDir: 'css/'
    }))
    .use(imagemin())
    .destination('./') 
    .build(function(err, files) {
      if (err) {
        console.log(err);
      } else {
        console.log('Forged!');
        if (typeof done === 'function') done();
      }
    });
};
