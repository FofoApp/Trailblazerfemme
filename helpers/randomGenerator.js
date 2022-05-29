const crypto = require('crypto');


const randomGenerator = () => {
    const key = crypto.randomBytes(32).toString('hex');
    console.table({ key });
    return key;
}

module.exports = randomGenerator;