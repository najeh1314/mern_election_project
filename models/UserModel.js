const mongooz = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = new mongooz.Schema({
    name:{
        type: String,
        required: true
    },
    sex:{
        type: String,
        enum: ['homme', 'femme']
    },
    role:{
        type: String,
        enum: ['admin', 'candidat', 'voter'],
        default: 'voter'
    },
    age:{
        type: Number,
        min: 18,
        max: 100
    },
    createdAt:{
        type: Date,
        default: () => Date.now()
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        minlength:[6,"PAssword too short👌"]
    },
    mail:{
        type: String,
        required: [true,"Mail is required"],
        unique: [true, "Mail already exists!"]
    },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


const user = mongooz.model('User', userSchema); 


module.exports = user;