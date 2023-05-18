const Model = require('./_model');

class Page extends Model {
    constructor(conn = null){
        console.log("page init()");
        super(conn);
        this.tableName = 'pages';
    }
    getIdsByUrl(url = []){
        let output = [];
        if(!url.length) {
            let sql = "SELECT id FROM `pages` WHERE `ishome` = '1'";
            try{
                let result = this.conn.querySync(sql);
                output.push(result[0]['id']);
            }
            catch(err)
            {
                return false;
            }
            return output;
        }
        else
        {
            let parent = 0;
            for(let i = 0; i < url.length; i++)
            {
                let sql = "SELECT pages.id FROM pages AS p, rel_pages_pages AS r WHERE p.active = '1' AND r.active = '1' AND p.id = r.c_id AND p.url = ? AND r.p_id = ?";
                try{
                    let result = this.conn.querySync(sql, [url[i], parent]);
                    parent = result[0].id;
                }
                catch(err)
                {
                    break;
                }
                output.push(id);                
            }
            return output;
        }
    }
    getByUrl(url = []){
        if(!url.length) {
            let sql = "SELECT * FROM `pages` WHERE `ishome` = '1'";
            try{
                let result = this.conn.querySync(sql);
                return result[0];
            }
            catch(err)
            {
                return null;
            }
        }
        else
        {
            let id = this.getIdsByUrl(url).pop();
            if(id === false) return null;
            let sql = "SELECT * FROM ? WHERE `id` = '?'";
            try{
                let result = this.conn.querySync(sql, [this.tableName, id]);
                return result[0];
            }
            catch(err)
            {
                return null;
            }
        }
    }
    getChildren(id){
        let output = [];
        if(typeof id === 'object') {
            if(typeof id.id == 'undefined') return output;
            id = id.id;
        }
        let sql = "SELECT pages.* FROM pages AS p, rel_pages_pages AS r WHERE p.active = '1' AND r.active = '1' AND r.p_id = ? AND p.id = r.c_id";
        try{
            let result = this.conn.querySync(sql, [id]);
            output = result;
            return output;

        }
        catch(err)
        {
            return output;
        }
    }
}

module.exports = new Page();