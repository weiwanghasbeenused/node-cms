const mysql = require('mysql');
const conn = {
    poll: null,
    init: function(req, res, next){
        try{
            // this.connection = mysql.createConnection({
            //     host: process.env.MYSQL_HOST,
            //     user: process.env.MYSQL_USER_RW,
            //     password: process.env.MYSQL_PASS_RW,
            //     database: process.env.MYSQL_DB,
            //     port: process.env.MYSQL_SOCKET
            // })
            this.pool = mysql.createPool({
                connectionLimit : 100,
                host: process.env.MYSQL_HOST,
                user: process.env.MYSQL_USER_RW,
                password: process.env.MYSQL_PASS_RW,
                database: process.env.MYSQL_DB,
                port: process.env.MYSQL_SOCKET
            })
            // this.pool.connect();
            if(typeof next == 'function') next();
        }
        catch(err)
        {
            console.error('conn.init error!');
            console.error(err);
        }
    },
    querySync: function(sql, binds = []){
        return new Promise(function(resolve, reject){
            this.pool.qeury(sql, ...binds, function(err, result){
                this.pool.release()
                if(err) throw err;
                resolve(result)
            });
        });
    },
};

module.exports = conn;