const UserModel = require("../models/UserModel");
const CommentModel = require("../models/CommentModel")
const ElectionModel = require("../models/ElectionModel")
const VoteModel = require("../models/VotesModel")
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
    },
    unsubscribe: async(req, res) =>{
        try {
            // 1. Vérifier si l'utilisateur est authentifié
            if (!req.user || !req.user.id) {
                return res.status(400).json({ message: "Invalid Token, session expired. Please log in again!" });
            }
            // Récupérer l'ID de l'utilisateur à supprimer depuis les paramètres
            const userId = req.user.id;
            
            // 2. Récupérer l'utilisateur depuis la base de données
            const user = await UserModel.findById(userId);
            if (!userId) {
                return res.status(404).json({ message: `User with ID ${userId} not found.` });
            }
            // Supprimer l'utilisateur dans la base de données
            const deletedUser = await UserModel.findByIdAndDelete(userId);
            // Vérifier si l'utilisateur existe
            if (!deletedUser) {
                return res.status(404).json({ message: `user with ID ${userId} not found.` });
            }
            // Répondre avec succès
            res.status(200).json({
                message: "account successfully deleted.",
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
    voter: async (req, res) => {
        try {
            // 1. Vérifier si l'utilisateur est authentifié
            if (!req.user || !req.user.id) {
                return res.status(400).json({ message: "Invalid Token, session expired. Please log in again!" });
            }
            const { id: currentUserId } = req.user;

            // 2. Récupérer l'utilisateur depuis la base de données
            const currentUser = await UserModel.findById(currentUserId);
            if (!currentUser) {
                return res.status(404).json({ message: `User with ID ${currentUserId} not found.` });
            }
            if (currentUser.role !== 'voter') {
                return res.status(400).json({ message: `${currentUser.role} are not allowed to vote. verify if you  are validated as a voter by admin` });
            }
            
            // 3. Vérifier que les données de l'élection et du candidat sont présentes
            const { election, candidatChoosen } = req.body;
            if (!election) {
                return res.status(400).json({ message: "Election and candidate choice are required." });
            }

            // 4. Vérifier si l'utilisateur a déjà voté dans cette élection
            const existingVote = await VoteModel.findOne({ user: currentUser._id, election: election });
            if (existingVote) {
                return res.status(400).json({ message: "You have already voted in this election." });
            }

            // 5. Créer l'objet vote
            const vote = {
                user: currentUser,
                election: election,
                candidatChoosen: candidatChoosen
            };

            // 6. Sauvegarder le vote dans la base de données
            await VoteModel.create(vote);

            // 7. Répondre avec un message de succès
            return res.status(200).json({
                message: "Vote successfully registered.",
                vote: vote
            });
        } catch (err) {
            console.error("Error while registering vote:", err);
            return res.status(500).json({ message: "Internal Server Error.", error: err.message });
        }
    },
    getVoteResults: async (req, res) => {
        try {
            // Récupérer l'ID de l'élection depuis les paramètres de la requête
            const {id: electionId} = req.params; 
                
            // 1. Récupérer tous les votes pour cette élection
            const votes = await VoteModel.find({  election: electionId});

            console.log(votes)
    
            // 2. Si aucune donnée n'est trouvée, renvoyer une erreur
            if (!votes || votes.length === 0) {
                return res.status(404).json({ message: "No votes found for this election." });
            }
    
            // 3. Compter le nombre total de votes
            const totalVotes = votes.length;
    
            // 4. Créer un objet pour compter les votes pour chaque candidat
            const candidateVotes = {};
    
            // 5. Parcourir les votes et les compter par candidat
            votes.forEach(vote => {
                const candidat = vote.candidatChoosen; // Récupérer le candidat choisi par l'utilisateur
                if (!candidateVotes[candidat]) {
                    candidateVotes[candidat] = 0; // Initialiser à 0 si le candidat n'est pas encore dans l'objet
                }
                candidateVotes[candidat] += 1; // Incrémenter le nombre de votes pour ce candidat
            });
    
            // 6. Calculer le pourcentage des votes pour chaque candidat
            const results = Object.keys(candidateVotes).map(candidat => {
                const count = candidateVotes[candidat];
                const percentage = ((count / totalVotes) * 100).toFixed(2); // Calculer le pourcentage
                return { candidat, count, percentage };
            });
    
            // 7. Répondre avec les résultats
            return res.status(200).json({ results });
        } catch (err) {
            console.error("Error while getting vote results:", err);
            return res.status(500).json({ message: "Internal Server Error.", error: err.message });
        }
    },
    comment: async(req, res) =>{
        try {
            // 1. utilisateur qui commente peut etre anonymos si aucun user est connectée
            let currentUser;
            if (!req.user || !req.user.id) {
                //Récupérer un utilisateur anonymos depuis la base de données
                currentUser = await UserModel.findOne({"name": "anonymos"});               
            }else{
                const { id: currentUserId } = req.user;
                if (!currentUserId) {
                    return res.status(404).json({ message: `user with ID ${currentUserId} not connected, please reconnect` });
                }
                //Récupérer l'utilisateur depuis la base de données
                currentUser = await UserModel.findById(currentUserId);               
            }   
            
            //2. recuperer le texte commentaire et le condidant a commenter du requerst
            const {commentContent: content, profileCandidat: profile}  = req.body;

            // 4. Créer l'objet comment
            const comment = {
                user: currentUser,
                profileCandidat: profile,
                commentContent: content,
                dateComment: new Date()
            };

            // 5. Sauvegarder le comment dans la base de données
            await CommentModel.create(comment);

            // 6. Répondre avec un message de succès
            return res.status(200).json({
                message: "comment successfully registered.",
                comment: comment
            });
        } catch (err) {
            console.error("Error while registering vote:", err);
            return res.status(500).json({ message: "Internal Server Error.", error: err.message });
        }

    },
    getAllCondidate: async(req, res) =>{
        try {
            const candidatList = await UserModel.find({role: 'candidat'});
            res.status(200).json(candidatList);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({
                message: "Erreur lors de la récupération des utilisateurs.",
                error: err.message
         });
        }
    },
    getProfile: async(req, res) =>{
        try{
            // 1. Vérifier si l'utilisateur est authentifié
            if (!req.user || !req.user.id) {
                return res.status(400).json({ message: "Invalid Token, session expired. Please log in again!" });
            }
            // 2. Recupere l'id de l'utilisateur courant
            const { id: currentUserId } = req.user;
            // 3. Recuppère l'utilisateur depuis la BD
            const currentUser = await UserModel.findById(currentUserId);
            if (!currentUser) {
                return res.status(404).json({ message: `User with ID ${currentUserId} not found.` });
            }
            res.status(200).json(currentUser);            
        }
        catch (err) {
            console.error(err.message);
            res.status(500).json({
                message: "Erreur lors de la récupération du profile de l'utilisateur en cours.",
                error: err.message
            });
        }
    },
    getElection: async (req, res) => {
        try {
            // Récupérer l'ID de l'élection depuis les paramètres de la requête
            const {dateElection, typeElection} = req.body; 
            // Vérifier si les paramètres sont valides
            if (!dateElection || !typeElection) {
                return res.status(400).json({ message: 'Date and type of election are required.' });
            }
        // Récupérer l'élection correspondante dans la base de données
        const results = await ElectionModel.findOne({
            dateElection: dateElection,
            typeElection: typeElection
        });
    
            // Si aucun résultat n'est trouvé, retournez un tableau vide
            if (!results) {
                return res.status(200).json({ results: [], dtae: dateElection, type: typeElection });

            }
            //Répondre avec les résultats
            return res.status(200).json(results );
        } catch (err) {
            console.error("Error while getting election choosen:", err);
            return res.status(500).json({ message: "Internal Server Error.", error: err.message });
        }
    },
    getElections: async(req, res) =>{
        try {
            const elections = await ElectionModel.find();
            res.status(200).json(elections);
        } catch (err) {
            console.error(err.message);
            res.status(500).json({
                message: "Erreur lors de la récupération des elections.",
                error: err.message
         });
        }
    }, 
    updateProfile: async(req, res) =>{
        try{
            //1. Vérifier si l'utilisateur est authentifié
            if (!req.user || !req.user.id) {
                return res.status(400).json({ message: "Invalid Token, session expired. Please log in again!" });
            }
            // 2. Récupérer l'ID de l'utilisateur courant
            const userId = req.user.id;

            // 3. Récupérer l'utilisateur courant dans la base de données
            const currentUser = await UserModel.findById(userId);
            if (!currentUser) {
                return res.status(404).json({ message: `User with ID ${userId} not found.` });
            }

            // 4. Récupérer les nouvelles données à mettre à jour
            const updatedData = req.body;

            // 5. Mettre à jour l'utilisateur courant
            Object.keys(updatedData).forEach((key) => {
                currentUser[key] = updatedData[key];
            });

            // 6. Sauvegarder l'utilisateur mis à jour dans la base de données
            await currentUser.save();

            // 7. Retourner une réponse avec les nouvelles informations de l'utilisateur
            return res.status(200).json({
                message: "User profile updated successfully.",
                user: currentUser
            });

    } catch (err) {
        console.error("Erreur lors de la modification du profil de l'utilisateur :", err);
        res.status(500).json({
            message: "Server internal error while updating user.",
            error: err.message
        });
    }



    }  
};

module.exports = userController;