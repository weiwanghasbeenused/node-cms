const express = require('express');
const router = express.Router();
const pp = require(__dirname + "/../models/page");
const pool = require('./../utils/conn');
pp.setPool(pool);
router.get('/*', function(req, res){
    pp.getBrowseParams(req.cmsParams.uri, function(params){
        params['path'] = req.cmsParams.uri.length ? '/' + req.cmsParams.uri.join('/') : '';
        res.render('browse', params);
    });
});

module.exports = router;