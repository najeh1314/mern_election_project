const UserModel = require("../models/UserModel");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userController = {
    register: async (req, res) => {
        try {
            // Vérifier si l'utilisateur existe déjà (par exemple, avec un email unique)
            const { mail, cin } = req.body; // Supposons que chaque utilisateur a un email unique
            if(!mail || !cin)
                return res.status(400).json({
                    message: "cin and email are required."
                });
            const existingMail = await UserModel.findOne({ mail }) 
            const existingCin =  await UserModel.findOne({ cin });
            if (existingCin) {
                return res.status(409).json({
                    message: "cin is already used."
                });
            }
            if (existingMail) {
                return res.status(409).json({
                    message: "mail is already used."
                });
            }


    
            // Créer un nouvel utilisateur si aucune duplication n'est trouvée
            const user = await UserModel.create(req.body);
    
            res.status(201).json({
                message: "Utilisateur enregistré avec succès.",
                user
            });
        } catch (err) {
            console.error("Erreur lors de l'enregistrement :", err.message);
            res.status(500).json({
                message: "Erreur lors de l'enregistrement de l'utilisateur.",
                error: err.message
            });
        }
    },
    logIn: async (req, res) => {
        const { mail, password } = req.body;
        try {
            const user = await UserModel.findOne({ mail });
            if (!user) return res.status(404).json({ message: "User not found" });
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) return res.status(400).json({ message: "Invalid credentials" });
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
            res.status(200).json({ token });
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    }
     
    
};

module.exports = userController;