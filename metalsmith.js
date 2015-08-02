var Metalsmith = require('metalsmith');
var changed    = require('metalsmith-changed');
var templates  = require('metalsmith-templates');
var Handlebars = require('handlebars');
var markdown   = require('metalsmith-markdown')
var prismic    = require('metalsmith-prismic');
var sass       = require('metalsmith-sass');
var imagemin   = require('metalsmith-imagemin');
var webpack    = require('metalsmith-webpack');
var optimize   = require('webpack').optimize;
var permalinks = require('metalsmith-permalinks');
var path       = require('path');
var fs         = require('fs');

// Debug Helper. Type {{ debug }} to log current context.
Handlebars.registerHelper("debug", function(optionalValue) {
  console.log("Current Context");
  console.log("====================");
  console.log(this);
  if (optionalValue) {
    console.log("Value");
    console.log("====================");
    console.log(optionalValue);
  }
});

// Register all partials in "./templates/partials".
fs.readdirSync('templates/partials').forEach(function(file) {
  var name = file.split(".")[0];
  var contents = fs.readFileSync(__dirname + "/templates/partials/" + file).toString();
  Handlebars.registerPartial(name, contents);
});

// If there's a prismic config use it.
// Otherwise, run the build without it but show a notice.
try {
  var prismicConfig = JSON.parse(fs.readFileSync('./prismic-config.json'));
  var prismicTask   = prismic(prismicConfig);
} catch(err) {
  var prismicTask = function() {
    console.log('Note: Create a prismic-config.json to start pulling content from your Prismic.io repository.');
  };
}

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
    .use(markdown())
    .use(webpack(webpackConfig))
    .use(templates('handlebars'))
    .use(sass({
      outputDir: 'css/'
    }))
    .use(permalinks({
      pattern: ':title'
    }))
    .use(imagemin())
    .destination('./dist') 
    .build(function(err, files) {
      if (err) {
        console.log(err);
      } else {
        console.log('Forged!');
        if (typeof done === 'function') done();
      }
    });
};
