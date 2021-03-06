var express = require('express'),
    stylus = require('stylus'),
    path = require('path'),
    analysis = require('./lib/analysis'),
    jshint = require('./lib/jshint'),
    app = express();


module.exports.analyzer = analysis;
module.exports.jshint = jshint;

module.exports.viewer = function(options) {
  options = options || {};

  app.locals({
    inspect: function (obj) {
      return '<pre>'+require('util').inspect(obj, true, 5)+'</pre>';
    },
    embed_json: function(obj, name) {
      var escaped = JSON.stringify(obj);
      return "<script> " + name + " = " + escaped + "; </script>";
    }
  });

  // Jade
  app.set('view engine', 'jade');

  // Stylus
  function compile(str, path) {
    return stylus(str)
      .set('compress', true)
      .set('filename', path);
  }

  var styles = stylus.middleware({
    src: path.join(__dirname, './'),
    dest: path.join(__dirname, './public'),
    compile: compile,
    force: true
  });

  app.use(styles);
  app.use(express['static'](path.join(__dirname, 'public')));


  analysis.hint(options);

  app.get('/*', function(req, res) {
    return res.render(path.join(__dirname, 'viewer'), {summary: analysis.summary, results:analysis.errors});
  });

  app.listen(options.port || 8080);
};