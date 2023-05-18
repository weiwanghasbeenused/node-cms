function auth(req, res, next){
    const reject = () => {
        res.setHeader("www-authenticate", "Basic");
        res.sendStatus(401);
    };
    const authorization = req.headers.authorization;
    if (!authorization) {
        return reject();
    }
    const [username, password] = Buffer.from(
        authorization.replace("Basic ", ""),
        "base64"
    ).toString().split(":");
    if (!(username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS)) {
        return reject();
    }
    return next();
}

module.exports = auth;