const Users = require('../models/users');

exports.getleaderboard = async (req, res, next) => {
    try {
      const leaderboardusers = await Users.find()
        .sort({ totalExpense: -1 }) // Sort by totalExpense in descending order
        .select('_id name totalExpense'); // Only select the _id, name, and totalExpense fields
  
      res.status(200).json(leaderboardusers);
    } catch (err) {
      res.status(500).json(err);
    }
  };