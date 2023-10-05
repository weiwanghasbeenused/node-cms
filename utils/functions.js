const functions = {
    getNow: function(){
        let ts = new Date();
        let output = ts.getFullYear() + '-';
        output += ts.getMonth() + 1 < 10 ? '0' + (ts.getMonth() + 1) + '-' : ts.getMonth() + 1 + '-';
        output += ts.getDate() < 10 ? '0' + ts.getDate() + ' ' : ts.getDate() + ' ';
        output += ts.getHours() < 10 ? '0' + ts.getHours() + ':' : ts.getHours() + ':';
        output += ts.getMinutes() < 10 ? '0' + ts.getMinutes() + ':' : ts.getMinutes() + ':';
        output += ts.getSeconds() < 10 ? '0' + ts.getSeconds() : ts.getSeconds();
        return output;
    }
}

module.exports = functions;