const Model = require('./_model');

class Page extends Model {
    constructor(){
        super();
        this.tableName = 'pages'
        this.pool = null;
        this.sql = {
            'getHome': "SELECT * FROM `pages` WHERE `ishome` = '1'",
            'getChildByUrl': "SELECT p.* FROM pages AS p, rel_pages_pages AS r WHERE p.active = '1' AND r.active = '1' AND p.id = r.c_id AND p.url = ? AND r.p_id = ?",
            'getById':  "SELECT * FROM ? WHERE `id` = ?",
            'getChildren': "SELECT p.* FROM pages AS p, rel_pages_pages AS r WHERE p.active = '1' AND r.active = '1' AND r.p_id = ? AND p.id = r.c_id",
        };
    }
    setPool(pool){
        this.pool = pool;
    }
    getItemsByUrls(urls, cb, items = [], idx = 0, p_id = 0){
        if(!urls.length) {
            cb(items);
            return;
        };
        let sql = this.sql['getChildByUrl'];
        let c_url = urls[idx];
        let values = [c_url, p_id];
        this.pool.getConnection(function(err, conn){
            conn.query(sql, values, function(error, result){
                if(error) console.log(error);
                p_id = result[0]['id'];
                items.push(result[0]);
                idx++;
                if(idx == urls.length) 
                    cb(items);
                else
                    this.getItemsByUrls(urls, cb, items, idx, p_id);
            }.bind(this));
        }.bind(this));
    }
    getByUrl(url = []){
        if(!url.length) {
            let sql = "SELECT * FROM `pages` WHERE `ishome` = '1'";
            try{
                console.log('fix this in page.js...');
                // let result = this.pool.querySync(sql);
                // return result[0];
            }
            catch(err)
            {
                return null;
            }
        }
        else
        {
            let id = this.getItemsByUrls(url).pop();
            if(!id) return null;
            let sql = this.sql['getById'];
            let values = [id];
            try{
                this.pool.getConnection(function(err, conn){
                    conn.query(sql, values, function(error, result){
                        return result[0];   
                    });

                });
            }
            catch(err)
            {
                return null;
            }
        }
    }
    getById(id, cb){
        if(isNaN(id)) return;
        let sql = this.sql['getById'];
        let values = [id];
        this.pool.getConnection(function(err, conn){
            conn.query(sql, values, function(error, result){
                cb(result[0].id);
            });
        });
    }
    
    getChildren(id, cb){
        if(isNaN(id)) return;
        let output = [];
        if(typeof id === 'object') {
            if(typeof id.id == 'undefined') return output;
            id = id.id;
        }
        let sql = this.sql['getChildren'];
        let values = [id];
        this.pool.getConnection(function(err, conn){
            conn.query(sql, values, function(error, result){
                cb(result);
            });
        });
    }
    getBrowseParams(uri, callback){
        let isRoot = uri.length == 0;
        this.getItemsByUrls(uri, function(items){
            let self_id = items.length ? items[items.length - 1]['id'] : 0;
            this.getChildren(self_id, function(children){
                    let params = {'tree': items, 'children': children};
                    callback(params);
            });
        }.bind(this));
    }
}

module.exports = new Page();