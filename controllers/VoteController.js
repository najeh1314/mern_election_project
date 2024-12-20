const VoteModel = require('../models/VotesModel');
const UserModel = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const voteController = {
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

            // 3. Vérifier que les données de l'élection et du candidat sont présentes
            const { election, candidatChoosen } = req.body;
            if (!election || !candidatChoosen) {
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
    }
};

module.exports = voteController;
