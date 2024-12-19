const mongooz = require('mongoose');
const UserModel = require('../models/UserModel')

const electionSchema = new mongooz.Schema({
   dateElection:{
        type: Date,
        default: () => Date.now()
    },
    typeElection:{
        type: String,
        enum: ['Presidential', 'Parliamentary', 'Municipal'],
        default: 'Parliamentary'
    },
    candidates: [{
        type: mongooz.Schema.Types.ObjectId,  // Define this as an array of ObjectId references
        ref: 'User',  // Refers to the `User` model
        required: true,
        minlength: [2, "There should be more than one candidate in the list👌"]
    }]

});

const election = mongooz.model('Election', electionSchema); 
module.exports = election;