'use strict';

const Translator = require('../components/translator.js');

module.exports = function (app) {
  
  const translator = new Translator();
  console.log(translator.consolee())

  app.route('/api/translate')
    .post((req, res) => {
      
      
    });
};
