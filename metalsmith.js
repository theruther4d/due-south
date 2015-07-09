var _          = require('lodash');
var Metalsmith = require('metalsmith');
var changed    = require('metalsmith-changed');
var templates  = require('metalsmith-templates');
var Handlebars = require('handlebars');
var markdown   = require('metalsmith-markdown')
var prismic    = require('metalsmith-prismic');
var sass       = require('metalsmith-sass');
var imagemin   = require('metalsmith-imagemin');
var fs         = require('fs');
var permalinks = require('metalsmith-permalinks');

module.exports = function metalSmith() {

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

  // Register all partials in `template/partials`
  _.each(fs.readdirSync('templates/partials'),function(file) {
    var name = file.split(".")[0];
    var contents = fs.readFileSync(__dirname+"/templates/partials/"+file).toString();
    Handlebars.registerPartial(name, contents);
  });

  var prismicConfig = JSON.parse(fs.readFileSync('./prismic-config.json'));

  Metalsmith(__dirname)
    .clean(false)
    .use(changed())
    .use(prismic(prismicConfig))
    .use(markdown())
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
      }
    });
};
