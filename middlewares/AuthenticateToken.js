const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');


const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Denied access, missing Token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Vérifie le token
        const user = await UserModel.findById(decoded.id); // Récupère l'utilisateur depuis la BD
        if (!user) {
            return res.status(404).json({ message: 'wrong Token! or, connexion data is expired! Please connect again to continue' });
        }

        req.user = user; // Ajoute l'utilisateur complet à `req.user`
        next(); // Passe au middleware suivant ou à la route
    } catch (err) {
        res.status(403).json({ message: 'Token invalide', error: err.message });
    }
};

module.exports = authenticateToken;
