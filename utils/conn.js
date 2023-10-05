const mysql = require('mysql');
let pool = null;
try{
    pool = mysql.createPool({
        connectionLimit : 100,
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER_RW,
        password: process.env.MYSQL_PASS_RW,
        database: process.env.MYSQL_DB,
        port: process.env.MYSQL_SOCKET
    })
}
catch(err)
{
    console.error('>>> mysql failed to create pool!');
    console.error(err);
}
module.exports = pool;