const mongoose = require('mongoose');
const Membership = require('./../../models/adminModel/AdminMembershipModel');

exports.createUserMembership = async (req, res, next) => {
     //POST REQUEST || CREATE MEMBERSHIP FOR USERS
    //ADMIN ACCESS ONLY
    /**
     * {
        "name":"Bronze",
        "amount": 2000,
        "benefits": ["Health care", "Feeding"],
        "description": "Bronze description"
        }
     */


    try {
        const checkIfMembershipExist = await Membership.findOne({ name: req.body.name });

        if(checkIfMembershipExist){
            return res.status(401).send({ error: "Membership name already exsit" });
        }

        const createMembership = new Membership(req.body);
        const saveMembership = await createMembership.save();
        return res.status(200).send(saveMembership);

    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}

exports.listUserMembership = async (req, res, next) => {
    //GET REQUEST 
    //http://localhost:2000/api/membership/lists
    //http://localhost:2000/api/membership/lists
    try {
        const memberships = await Membership.find({});

        if(!memberships){
            return res.status(401).send({ error: "No membership found" });
        }

        return res.status(200).send(memberships);

    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}


exports.findUserMembershipById = async (req, res, next) => {
    //GET REQUEST 
    //http://localhost:2000/api/membership/:membershipId/find
    //http://localhost:2000/api/membership/62ae5da240918ee364510517/find
    const {membershipId} = req.params;
    try {
        
        if(!mongoose.Types.ObjectId.isValid(membershipId)) {
            return res.status(401).send({ error: "Invalid membership parameter"});
        }

        const membership = await Membership.findById(membershipId);

        if(!membership){
            return res.status(401).send({ error: "Membership not found" });
        }

        return res.status(200).send(membership);

    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}

exports.updateUserMembership = async (req, res, next) => {
    //PATCH REQUEST 
    //http://localhost:2000/api/membership/:membershipId/update
    //http://localhost:2000/api/membership/62ae5da240918ee364510517/update
    /**
     * {
        "description": "Bronze description now update"
        }
     */
    const {membershipId} = req.params;
    try {
        
        if(!mongoose.Types.ObjectId.isValid(membershipId)) {
            return res.status(401).send({ error: "Invalid membership parameter"});
        }

        const checkIfMembershipExist = await Membership.findByIdAndUpdate(membershipId, { $set: req.body }, {new: true});

        if(!checkIfMembershipExist){
            return res.status(401).send({ error: "Unable to update membership" });
        }

        return res.status(200).send({message: "Membership updated successfully"});

    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}

exports.deleteUserMembership = async (req, res, next) => {
    //DELETE REQUEST 
    //http://localhost:2000/api/membership/:membershipId/update
    //http://localhost:2000/api/membership/62ae5da240918ee364510517/update

    const {membershipId} = req.params;
    try {
        
        if(!mongoose.Types.ObjectId.isValid(membershipId)) {
            return res.status(401).send({ error: "Invalid membership parameter"});
        }

        const checkIfMembershipExist = await Membership.findByIdAndDelete(membershipId);

        if(!checkIfMembershipExist){
            return res.status(401).send({ error: "Unable to delete membership" });
        }

        return res.status(200).send({message: "Mmebership deleted successfully"});

    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}