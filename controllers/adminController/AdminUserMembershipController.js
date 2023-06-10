const mongoose = require('mongoose');
const MembershipSubscriber = require('../../models/membershipModel/MembershipSubscribersModel');
const User = require('../../models/UserModel');
const Membership = require('./../../models/adminModel/AdminMembershipModel');

exports.createUserMembership = async (req, res, next) => {
    
    let { name, amount, benefits, perks, description, accessType } = req.body;

    // const accType = accessType.split(",");


     //POST REQUEST || CREATE MEMBERSHIP FOR USERS
    //ADMIN ACCESS ONLY
    /**
     * {
        "name":"Bronze",
        "amount": 2000,
        "benefits": "Health care, Feeding, Housing",
        "description": "Bronze description"
        "accessType": "Free"
        }
     */


    try {

        const checkIfMembershipExist = await Membership.findOne({ name });

        if(checkIfMembershipExist){
            return res.status(401).json({ status: "failed", error: "Membership name already exsit" });
        }

        const createMembership = new Membership({ name, amount, benefits, perks, description, accessType: accessType  });

        const saveMembership = await createMembership.save();

        if(!saveMembership)  {
            return res.status(403).send({ status: "failed", error: "Membership not created" });
        }

        const member_data = { 
            id: saveMembership.id, 
            name: saveMembership.name, 
            accessType: saveMembership.accessType,
            benefits: saveMembership.benefits,
            perks: saveMembership.perks,
            description: saveMembership.description,
            amount: saveMembership.amount,
            createdAt: saveMembership.createdAt
        }

        return res.status(200).json({ status: "success", membership: member_data });

    } catch (error) {
        return res.status(500).send({ status: "failed", error: error?.message });
    }
}

exports.listUserMembership = async (req, res, next) => {

    //GET REQUEST 
    //http://localhost:2000/api/membership/lists
    //http://localhost:2000/api/membership/lists

    try {
        const memberships = await Membership.paginate({}, {
            page: 1,
            limit: 10,
            select: "id name accessType perks benefits description amount createdAt members",
            populate: {
                path: "members",
                model: "User",
                select: "id fullname profileImage createdAt"
            }
        });

        if(!memberships){
            return res.status(401).send({ error: "No membership found" });
        }

        return res.status(200).json({ memberships });

    } catch (error) {
        return res.status(500).json({ error: error?.message });
    }
}


exports.findUserMembershipById = async (req, res, next) => {
    //GET REQUEST 
    //http://localhost:2000/api/membership/:membershipId/find
    //http://localhost:2000/api/membership/62ae5da240918ee364510517/find

    const { membershipId } = req.params;
    
    try {
        
        if(!mongoose.Types.ObjectId.isValid(membershipId)) {
            return res.status(401).send({ error: "Invalid membership parameter"});
        }

        const membership = await Membership.findById(membershipId);
        console.log(membership)
        // const membership = await MembershipSubscriber.findById(membershipId).populate({
        //     path: "members",
        //     model: "User",
        // });

        const subscribers = await MembershipSubscriber.paginate({}, {
            populate: { 
                path: "userId",
                model: "User",
                select: "id fullname profileImage createdAt "
             }
        });

        if(!membership){
            return res.status(401).send({ error: "Membership not found" });
        }

        const member_data = { 
            id: membership.id, 
            name: membership.name, 
            accessType: membership.accessType,
            benefits: membership.benefits,
            perks: membership.perks,
            description: membership.description,
            amount: membership.amount,
            createdAt: membership.createdAt,
            subscribers
        }

        return res.status(200).send({ membership: member_data });


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
        "name":"Premium",
        "amount": 2000,
        "benefits": "Health care, Feeding, Housing",
        "description": "Bronze description",
        "accessType": "Free"
        }
     */

    const { membershipId } = req.params;

    if(req.body?.accessType) {
        req.body.accessType = req.body.accessType.split(",")
    }

    let { name, amount, perks, benefits, description, accessType } = req.body;

    let update_data = { name, amount, benefits, description, accessType };

    console.log(update_data)

    try {
        
        if(!mongoose.Types.ObjectId.isValid(membershipId)) {
            return res.status(401).send({ error: "Invalid membership parameter"});
        }

        let checkIfMembershipExist = await Membership.findByIdAndUpdate(membershipId, { 
            $set: update_data,
            $addToSet: perks
        }, {new: true});

        if(!checkIfMembershipExist){
            return res.status(401).send({ error: "Unable to update membership" });
        }

        const member_data = { 
            id: checkIfMembershipExist?.id, 
            name: checkIfMembershipExist?.name, 
            accessType: checkIfMembershipExist?.accessType,
            benefits: checkIfMembershipExist?.benefits,
            perks: checkIfMembershipExist?.perks,
            description: checkIfMembershipExist?.description,
            amount: checkIfMembershipExist?.amount,
            createdAt: checkIfMembershipExist?.createdAt
        }

        return res.status(200).send({message: "Membership updated successfully", membership: member_data });

    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}

exports.deleteUserMembership = async (req, res, next) => {
    //DELETE REQUEST 
    //http://localhost:2000/api/membership/:membershipId/update
    //http://localhost:2000/api/membership/62ae5da240918ee364510517/delete

    const { membershipId } = req.params;

    try {
        
        if(!mongoose.Types.ObjectId.isValid(membershipId)) {
            return res.status(401).send({ error: "Invalid membership parameter"});
        }

        const checkIfMembershipExist = await Membership.findByIdAndDelete(membershipId);

        if(!checkIfMembershipExist){
            return res.status(401).send({ error: "Unable to delete membership" });
        }

        return res.status(200).send({message: "Membership deleted successfully"});

    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
}
