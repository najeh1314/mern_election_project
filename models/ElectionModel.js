const mongooz = require('mongoose');
const UserModel = require('../models/UserModel')

const electionSchema = new mongooz.Schema({
   dateElection:{
        type: String
    },
    typeElection:{
        type: String,
        enum: ['Presidential', 'Parliamentary', 'Municipal'],
        default: 'Parliamentary'
    },
    candidates: [{
            name:String,
            img: String,
            plane: String       
    }]

});

const election = mongooz.model('Election', electionSchema); 
module.exports = election;