class APIFeatures {
    constructor(query, queryStr){
        this.query = query;
        this.queryStr = queryStr;

    }
    
    search() {

        const keyword = this.queryStr
        ? {
            $or: [
                    { title: {  $regex: '.*' + this.queryStr + '.*',  $options: 'i'  } },
                    { author: { $regex: '.*' + this.queryStr + '.*',  $options: 'i' } },
                ],
        } : {}

        this.query = this.query.find({...keyword});

        return this;
    }
}

module.exports = APIFeatures;