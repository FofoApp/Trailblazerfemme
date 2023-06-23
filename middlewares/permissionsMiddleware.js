

exports.permissions = (permissions) => (req, res, next) => {
    
    const { role } = req.user;
    
    if(!permissions.includes(role)) {
        return res.status(401).json({ 
            status: "failed", 
            error: "Unauthorized user",  
            messsage: "Unauthorized user"
        });
    }

    next();
}
