const express = require('express');
const router = express.Router();
const pp = new require(__dirname + '/../models/page');

router.get('/*', function(req, res){
    res.render('form', {'fields': req.addParams.config.fields});
});

module.exports = function(params){
    // let {config, conn} = params;
    
    return router;
}