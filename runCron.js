const cron = require('node-cron');
const moment = require("moment");

const User = require("./models/UserModel");


const runCron = (req=null) => {    
    const taskScheduler = cron.schedule('* * * * * *', async function () {
        let today_date = moment(new Date()).format("YYYY-MM-DD hh:mm");
        const find_users = await User.find({});
        if(!find_users) return;
    
        for(let i = 0; i < find_users.length; i++) {
            let user = find_users[i];
            const previousDate = moment(user.nextPaymentDate).format("YYYY-MM-DD hh:mm");
       
            if(today_date >= previousDate)  {
                setIsPaid = { isPaid: false };
                Object.assign(user, setIsPaid);   
                // console.log('I will run once') 
                const result = await User.findByIdAndUpdate(user._doc._id, {$set: user}, { new: true });
            }
    
        }
        
    })
    
    // taskScheduler.stop()
} 


module.exports = runCron;