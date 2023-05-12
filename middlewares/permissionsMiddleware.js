

exports.permissions = (permissions) => (req, res, next) => {
    
    const { role } = req.user;
    
    if(!permissions.includes(role)) {
        return res.status(401).json({ messsage: "Unauthorized user"});
    }

    next();
}
