

exports.permissions = (permissions) => (req, res, next) => {
    
    const { roles } = req.user;

    if(!permissions.includes(roles)) {
        return res.status(401).send({ messsage: "Unauthorized"});
    }

    next();
}
