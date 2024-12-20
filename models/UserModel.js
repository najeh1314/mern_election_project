const mongooz = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = new mongooz.Schema({
    name:{
        type: String,
        required: true
    },
    role:{
        type: String,
        enum: ['admin', 'candidat', 'voter', 'citizen'],
        default: 'citizen'
    },
    cin: {
        type: String,
        minlength: 8,
        required: [true, "CIN is required"],
        unique: [true, "CIN already exists!"],
        validate: {
            validator: function(value) {
                return /^\d+$/.test(value); // Vérifie que le champ contient uniquement des chiffres
            },
            message: "Le CIN doit contenir uniquement des chiffres."
        }
    }
    ,
    /*
    ^\d+$ est une expression régulière :
        ^ : début de la chaîne.
        \d : correspond à un chiffre.
        + : un ou plusieurs chiffres.
        $ : fin de la chaîne.
    */
    createdAt:{
        type: Date,
        default: () => Date.now()
    },
    password:{
        type:String,
        required:[true,"Password is required"],
        minlength:[4,"PAssword too short👌"]
    },
    mail: {
        type: String,
        required: [true, "Mail is required"],
        unique: [true, "Mail already exists!"],
        validate: {
            validator: function(value) {
                // Expression régulière pour un email valide
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: "Invalid email format."
        }
    }
    /*
        ^[^\s@]+ : Commence par un ou plusieurs caractères qui ne sont ni un espace ni un @.
        @ : Doit contenir exactement un @.
        [^\s@]+\.[^\s@]+$ : Après le @, il doit y avoir un domaine (comme example.com).
        Cette expression régulière est largement utilisée pour valider les adresses e-mail simples.
    */  
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


const user = mongooz.model('User', userSchema); 


module.exports = user;