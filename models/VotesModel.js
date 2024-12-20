const mongooz = require('mongoose');

const voteSchema = new mongooz.Schema({
    user:{
        type:mongooz.Schema.Types.ObjectId,
        ref:'User'
    },
    election:{
        type:mongooz.Schema.Types.ObjectId,
        ref:'Election'
    },
    candidatChoosen:{
        type: String,
        default: 'indeffirent'
    }
});

const vote = mongooz.model('Vote', voteSchema); 
module.exports = vote;