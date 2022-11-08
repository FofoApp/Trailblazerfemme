

exports.permissions = (permissions) => (req, res, next) => {
    
    const { role } = req.user;
    
    if(!permissions.includes(role)) {
        return res.status(401).send({ messsage: "Unauthorized user"});
    }

    next();
}
