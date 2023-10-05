const express = require("express")
const app = express()
require('dotenv').config()
const port = process.env.WEBSITE_PORT || 3000;
const auth = require('./utils/auth');
const pool = require('./utils/conn');

/*
    password protection
*/
app.use(auth);

/*
    app specific config
*/

app.set('view engine', 'pug')
app.use(express.static(__dirname + "/public"));

/*
    routing
*/
const indexRouter = require('./routes/index')
const browseRouter = require('./routes/browse')
const editRouter = require('./routes/edit')
const addRouter = require('./routes/add')
const deleteRouter = require('./routes/delete')
const apiRouter = require('./routes/api')
let cmsParams = { 'pool': pool };
app.use('/*', function(req,res,next){
    let uri_raw = req.originalUrl.split('/');
    let uri = [];
    for(let i = 2; i < uri_raw.length; i++)
        uri.push(uri_raw[i]);
    cmsParams.uri = uri;
    cmsParams.action = uri_raw[1];
    req.cmsParams = cmsParams;
    next();
});
app.use('/', indexRouter);
app.use('/browse', browseRouter);
app.use('/edit', editRouter);
app.use('/add', addRouter);
app.use('/delete', deleteRouter);
app.use('/api', apiRouter);

app.listen(port, ()=>{
    console.log('the app is running on port ' + port)
})