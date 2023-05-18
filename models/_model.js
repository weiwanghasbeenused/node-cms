class Model{
    constructor(conn){
        this.tableName = '';
        this.conn = conn;
    }
    get(id){
        if(!this.tableName) return;
        let sql = "SELECT * FROM ? WHERE id = ?";
        this.conn.querySync(sql, [this.tableName, id]);
    }
    insert(obj){
        if(!this.tableName) return;
        let keys = [];
        let vals = [];
        let qmks = [];
        for(let prop in obj)
        {
            keys.push('`' + prop + '`');
            vals.push('`' + obj[prop] + '`');
            qmks.push('?');
        }
        let binds = keys.concat(vals);
        qmks = qmks.join(',');
        let sql = "INSERT INTO `" +this.tableName + "` (" + qmks + ') VALUES (' + qmks + ')';
        this.conn.querySync(sql, [this.tableName, ...binds]);
    }
    update(id, obj){
        if(!this.tableName) return;
        let binds = [];
        
        for(let prop in obj)
        {
            binds.push('`' + prop + '`');
            binds.push('`' + obj[prop] + '`');
            qmks.push('? = ?');
        }
        let sql = "UPDATE `" +this.tableName + "` SET " + qmks.join(',') + ' WHERE id = ?';
        this.conn.querySync(sql, [this.tableName, ...binds, id]);
    }
}
module.exports = Model;