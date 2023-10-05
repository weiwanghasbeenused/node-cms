const express = require('express');
const router = express.Router();
const config = require('./../config/config')
const pp = new require(__dirname + '/../models/page');

router.get('/*', function(req, res){
    pp.getItemsByUrls(req.cmsParams.uri, function(items){
        let fields = config.page.fields;
        let values = {};
        let item = items.pop();
        for(let name in fields) {
            let f = fields[name];
            values[name] = item[name] === null ? '' : item[name];
        }
        let targetId = item['id'];
        res.render('form', {'fields': config.page.fields, 'action': req.cmsParams.action, 'uri': req.cmsParams.uri, 'path': req.cmsParams.uri.join('/'), 'targetId': targetId, 'values': values});
    });
});

module.exports = router;