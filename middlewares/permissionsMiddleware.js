

const permissions = (permissions) => (req, res, next) => {

    const {roles} = req.body;

    if(!permissions.includes(roles)) {
        return res.status(401).send({ messsage: "Unauthorized"})
    }
    next();
}

module.exports = {
    permissions
}