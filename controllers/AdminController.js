const Vote = require('../models/VotesModel')
const UserModel = require('../models/UserModel');
const {admineRole} = require('../utils/AuthUtils')

const adminController = {
    findAllUsers: async (req, res) => {
        try {
            //Verfier si l'utilisateur connecté est un admin
            const adminAuth = admineRole(req.user)
            if(!adminAuth.authorized)
                res.status(401).json({message: adminAuth.message, role: adminAuth.role});

            //Recuperer tous les users dans la collection users
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
            //Verfier si l'utilisateur connecté est un admin            
            const adminAuth = admineRole(req.user)
            if(!adminAuth.authorized)
                res.status(401).json({message: adminAuth.message, role: adminAuth.role});

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
    updateUserRole: async (req, res) => {
        try {
            // Verification des droits d'administrateur ou super-admin
            const adminAuth = admineRole(req.user);
            if (!adminAuth.authorized) {
                return res.status(401).json({ message: adminAuth.message, role: adminAuth.role });
            }
    
            // Recuperation d'ID de l'utilisateur à mettre à jour son role depuis les parametres
            const userId = req.params.id;
            if (!userId) {
                return res.status(400).json({ message: "User ID is required." });
            }
            // Vérifier si l'utilisateur existe dans la base de données
            const userToUpdate = await UserModel.findById(userId);
            if (!userToUpdate) {
                return res.status(404).json({ message: `User with ID ${userId} not found.` });
            }
    
            // Recuperation des données à mettre à jour depuis le corps de la requête
            const {role: newRole} = req.body;
    
            // verif si les données ne sont pas vides
            const roles =['admin', 'candidat', 'voter', 'citizen'];
            if (!newRole || !roles.includes(newRole)) {
                return res.status(400).json({ message: "No valide role provided for new update." });
            }
    
            // Mise à jour du rôle de l'utilisateur
            userToUpdate.role = newRole;
            await userToUpdate.save();
    
            // Répondre avec succès
            res.status(200).json({
                message: "User successfully updated.",
                userToUpdate
            });
        } catch (err) {
            console.error("Error while updating user:", err);
            res.status(500).json({
                message: "Internal server error while updating user.",
                error: err.message
            });
        }
    }
    

}

module.exports = adminController;