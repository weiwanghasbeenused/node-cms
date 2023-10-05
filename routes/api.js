const express = require('express')
const router = express.Router()
const fs  = require('fs')
const multer  = require('multer')
const media_dir = __dirname + '/../public/media'
const upload = multer({ dest: __dirname + '/uploaded' });
const config = require('./../config/config');
const functions = require('./../utils/functions');
router.get('/media', function(req, res){
    let num = req.query.num ? parseInt(req.query.num) : 12;
    let offset = req.query.offset ? parseInt(req.query.offset) : 0;
    let pool = req.cmsParams.pool;
    let sql = 'SELECT `id`, `filename`, `type`, `caption`, `metadata` FROM `media` WHERE active = "1" ORDER BY `modified` LIMIT ? OFFSET ?';
    pool.getConnection(function(err, conn){
        conn.query(sql, [num, offset], function(error, result){
            let response = {
                'status': '',
                'content': ''
            };
            response.status = error ? 'error' : 'success';
            response.content = error ? error : result;
            conn.release();
            res.send(response);
        });
    })
});
router.post('/add/media', upload.array('media'), function(req, res){
    let pool = req.cmsParams.pool;
    let sql = 'INSERT INTO media (`created`,`modified`,`filename`,`type`,`caption`,`metadata`) VALUES (?,?,?,?,?,?)';
    let now = functions.getNow();
    
    pool.getConnection(function(err, conn){
        for(let i = 0 ; i < req.files.length ; i++)
        {
            let filetype = req.files[i].originalname.substring(req.files[i].originalname.lastIndexOf('.') + 1);
            let params = [now, now, req.files[i].filename, filetype, req.body['media-caption'][i], ''];
            conn.query(sql, params, function(error, result){
                console.log(result);
                if(error)
                {
                    console.log('mysql error');
                    let response = {
                        'status': 'error',
                        'content': error
                    };
                    conn.release();
                    res.send(response);
                    return;
                }
                fs.rename(req.files[i].path, media_dir + '/' + req.files[i].filename + '.' + filetype, async ()=>{ 
                    let response = {
                        'status': 'success',
                        'content': 'The media file(s) are uploaded successfully'
                    };
                    
                    res.send(response);
                })
            });
        }
        conn.release();
    })
});
router.post('/add/page', upload.none(), function(req, res){
    let uri = req.cmsParams.uri;
    let pool = req.cmsParams.pool;
    let fields = config['page'].fields;
    let qs = [];
    let cols = [];
    let values = [];
    let reqBody = req.body;
    let p_id = reqBody['targetId']; 
    let now = functions.getNow();
    for(let prop in fields) {
        cols.push('`' + prop + '`');
        qs.push('?');
        let val = (typeof reqBody[prop] == 'undefined' || reqBody[prop] === '') ? null : reqBody[prop];
        if(prop == 'url') console.log(val);
        if(prop == 'url' && !val && val !== 0){
            console.log('url');
            console.log();
            val = reqBody['name'].replace(' ', '-');
            val = encodeURIComponent(val);
            console.log(val);
        }
        values.push(val);
    }
    cols = cols.concat(['`modified`', '`created`']);
    qs = qs.concat(['?', '?']);
    let sql = 'INSERT INTO pages (' + cols.join(',') + ') VALUES ('+qs.join(',')+')';
    values = values.concat([now, now]);
    pool.getConnection(function(err, conn){
        conn.query(sql, values, function(error, result){
            let qs_r = [];
            let cols_r = [];
            for(let i = 0; i < config['rel_pages_pages']['columns'].length; i++)
            {
                qs_r.push('?');
                cols_r[i] = '`' + config['rel_pages_pages']['columns'][i] + '`';
            }
            let values_r = [p_id, result.insertId, 1, now, now];
            let sql_addRel = 'INSERT INTO rel_pages_pages (' + cols_r.join(',') + ') VALUES ('+qs_r.join(',')+')';
            conn.query(sql_addRel, values_r, function(error, result){
                console.log('>>> error >>>');
                console.log(error);
                console.log('<<<<<<<<<<<<<<');
                let response = {
                    'status': '',
                    'content': '',
                    'action': uri[2]
                };
                response.status = error ? 'error' : 'success';
                response.content = error ? error : result;
                conn.release();
                res.send(response);
            });
        });
    });
});

router.post('/edit/page', upload.none(), function(req, res){
    let uri = req.cmsParams.uri;
    let pool = req.cmsParams.pool;
    let fields = config['page'].fields;
    // let qs = [];
    // let cols = [];
    let values = [];
    let eqs = [];
    let reqBody = req.body;
    let id = reqBody['targetId']; 
    let now = functions.getNow();
    for(let prop in fields) {
        // cols.push('`' + prop + '`');
        // qs.push('?');
        eqs.push('`' + prop + '` = ?');
        let val = (typeof reqBody[prop] == 'undefined' || reqBody[prop] === '') ? null : reqBody[prop];
        if(prop == 'url') console.log(val);
        if(prop == 'url' && !val && val !== 0){
            val = reqBody['name'].replace(' ', '-');
            val = encodeURIComponent(val);
        }
        values.push(val);
    }
    // cols = cols.concat(['`modified`', '`created`']);
    // qs = qs.concat(['?', '?']);
    let sql = 'UPDATE pages SET ' + eqs.join(',') + ' WHERE id = "' + id + '"';
    values = values.concat([now, now]);
    pool.getConnection(function(err, conn){
        conn.query(sql, values, function(error, result){
            let response = {
                'status': '',
                'content': '',
                'action': uri[2]
            };
            response.status = error ? 'error' : 'success';
            response.content = error ? error : result;
            conn.release();
            res.send(response);
        });
    });
});

module.exports = router;