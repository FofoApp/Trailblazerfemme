const User = require("../../models/UserModel");
const Membership = require('./../../models/adminModel/AdminMembershipModel')
const MembershipSubscriber = require("../../models/membershipModel/MembershipSubscribersModel");
const mongoose = require('mongoose');
const moment = require('moment');


exports.chooseMembershipPlan = async (req, res, next) => {
   
    const annually = 'years';
    const monthly = 'months';
    const days = 'days';

    try {
        
        const { membershipId, userId } = req.body;

        if(!mongoose.Types.ObjectId.isValid(membershipId)) {
            return res.status(401).send({ error: "Invalid membership"});
        }
        
        if(!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(401).send({ error: "Invalid user"});
        }

        let user = await User.findById(userId);
        
        if(!user) return res.status(404).send({ error: "Invalid user"});

        let membership = await Membership.findById(membershipId);
        
        if(!membership) return res.status(404).send({ error: "Invalid membership"});

        const subscriber = await MembershipSubscriber.findOne({ userId: userId, isActive: true });
       

        if(subscriber?.userId.toString() === userId.toString() && subscriber?.isActive === true ) {
            return res.status(404).send({ error: "You still have an active plan"});
        }

        // const date = calculateNextPayment(annually, moment().format());


        const start_date = moment();
        const end_date = moment().add(1, 'years');
        const diff = end_date.diff(start_date, 'days')

       let  membership_data =   {
                membershipType: membership.accessType,
                membershipId: membership.id,
                userId,
                isActive: true,
                isPaid: true,
                amount: membership.amount,
                subscription_start_date: start_date,
                subscription_end_date: end_date,
                days_between_next_payment: diff,
                paymentId: "ddddddddddddddd"
            }


        const create_new_subscriber = new MembershipSubscriber(membership_data);
        const save_new_subscriber = await create_new_subscriber.save();
           
            
        const updateUser = await User.findByIdAndUpdate(userId, { "$set":
            {
                "subscriptionId": save_new_subscriber.id,
                "paid": save_new_subscriber.isPaid,
                "isActive": save_new_subscriber.isActive,
                "membershipType": save_new_subscriber.membershipType,
                "amount": save_new_subscriber.amount,
                "subscription_end_date": save_new_subscriber.subscription_end_date,
                "subscription_start_date": save_new_subscriber.subscription_end_date,
                "days_between_next_payment": save_new_subscriber.subscription_end_date,
                
            } 
        }, { new: true }).exec();
        
        return res.status(200).send({ save_new_subscriber  });

    } catch (error) {
        console.log(error)
        return res.status(500).send({ error: error.message });
    }


}