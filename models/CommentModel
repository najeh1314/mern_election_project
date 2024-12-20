const mongooz = require('mongoose');

const commentSchema = new mongooz.Schema({
    user:{
        type:mongooz.Schema.Types.ObjectId,
        ref:'User',
    },
    profileCandidat:{
        type: mongooz.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    commentContent: String,
    dateComment:{
        type: Date,
        default: () => Date.now()
    },
});

const comment = mongooz.model('Comment', commentSchema); 
module.exports = comment;



