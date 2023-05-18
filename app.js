const express = require("express")
const app = express()
require('dotenv').config()
const port = process.env.WEBSITE_PORT || 3000;
const auth = require('./utils/auth');
const conn = require('./utils/conn');

/*
    password protection
*/
app.use(auth);

/*
    app specific config
*/
const config = require('./config/config')

/* mysql */
conn.init();
app.set('view engine', 'pug')
app.use(express.static(__dirname + "/public"));

/*
    routing
*/
const indexRouter = require('./routes/index')
const browseRouter = require('./routes/browse')
const editRouter = require('./routes/edit')
const addRouter = require('./routes/add')({'config': config, 'conn': conn})
const deleteRouter = require('./routes/delete')

app.use('/', indexRouter);
app.use('/browse', browseRouter);
app.use('/edit', editRouter);
app.use('/add', function(req,res,next){
    req.addParams = {
        'config': config,
        'conn': conn
    }
    next();
}, addRouter);
app.use('/delete', deleteRouter);

app.listen(port, ()=>{
    console.log('the app is running on port ' + port)
})