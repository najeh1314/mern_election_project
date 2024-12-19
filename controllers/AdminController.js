const Vote = require('../models/VotesModel')
const UserModel = require('../models/UserModel');

const adminController = {
    findAllUsers: async (req, res) => {
        try {
            const currentUser = req.user; // Informations utilisateur issues du token
            // if (!(req.user && (req.user.role === 'admin' || req.user.role === 'sup-admin'))) {
            if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'sup-admin')) {
                    return res.status(403).json({
                    message: "Log in as admin to have access!",
                    "You are": currentUser.role
                });
            }
            const users = await UserModel.find();
            res.status(200).json(users);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({
                message: "Erreur lors de la récupération des utilisateurs.",
                error: err.message
         });
        }
    },
    deleteUser: async (req, res) => {
        try {
            //verify if an admin who's connected to allow deletUser action
            const currentUser = req.user; // Informations utilisateur issues du token
            if (!(req.user && (req.user.role === 'admin' || req.user.role === 'sup-admin'))) {
                return res.status(403).json({
                    message: "Log in as admin to have access!",
                    "You are": currentUser.role
                });
            } 
            // Récupérer l'ID de l'utilisateur à supprimer depuis les paramètres
            const userId = req.params.id;
            // Vérifier si l'ID est valide
            if (!userId) {
                return res.status(400).json({ message: "user`s ID is required." });
            }
            //Verifier si l'utilisateur est un admin 
            const userToDelete = await UserModel.findById(userId);
            if(userToDelete && (userToDelete.role === 'admin' || req.user.role === 'sup-admin'))
                return res.status(403).json({
                    message: "Only super admin has access to delete user",
                    "user": userToDelete.role
                });
            // Supprimer l'utilisateur dans la base de données
            const deletedUser = await UserModel.findByIdAndDelete(userId);
            // Vérifier si l'utilisateur existe
            if (!deletedUser) {
                return res.status(404).json({ message: `user with ID ${userId} not found.` });
            }
            // Répondre avec succès
            res.status(200).json({
                message: "user is successfully deleted.",
                "deleted user": deletedUser
            });
        } catch (err) {
            console.error("Erreur lors de la suppression de l'utilisateur :", err);
            res.status(500).json({
                message: "Server inner Error while deleting user.",
                error: err.message
            });
        }
    },

}

module.exports = adminController;