const express = require('express');
const router = express.Router();
const pp = require(__dirname + "/../models/page");

router.get('/*', function(req, res){
    let tree = req.path.substring(1).split('/');
    let self = pp.getByUrl(tree);
    let children = self ? pp.getChildren(self.id) : [];
    // let ancestors = self ? pp.ancestors(self.id) : [];
    let ancestors = [];
    res.render('browse', {'tree': tree, 'self': self, 'children': children, 'ancestors': ancestors});
});

module.exports = router;