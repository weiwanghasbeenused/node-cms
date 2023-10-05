const express = require('express');
const router = express.Router();
const config = require('./../config/config')
const pp = new require(__dirname + '/../models/page');
router.get('/*', function(req, res){
    pp.getItemsByUrls(req.cmsParams.uri, function(items){
        let parent = items.pop();
        let targetId = parent ? parent['id'] : 0;
        let values = {};
        for(let name in config.page.fields) 
            values[name] = '';
        res.render('form', {'fields': config.page.fields, 'action': req.cmsParams.action, 'uri': req.cmsParams.uri, 'path': req.cmsParams.uri.join('/'), 'targetId': targetId, 'values': values});
    });
});

module.exports = router;