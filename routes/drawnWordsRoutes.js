const express = require('express')
const router = express.Router()
const drawnWordsCopy = require('../models/DrawnWordsModel')

router.post('/save', async (req, res) =>{
    const { ownerName, originHatTitle, items } = req.body;
    try {
        const newDrawnWords= new drawnWordsCopy({
            ownerName,
            originHatTitle,
            items
        });
        await newDrawnWords.save();
        res.status(200).send("List of words saved successfully");
    } catch (error) {
        console.error("Error saving hat theme:", error);
        res.status(500).send("Error saving hat theme");
    }
})

router.get('/my-drawn-list', async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 4;
      const skipCount = (page - 1) * limit;
      const currentUser = req.query.username;
      
      const onlyCurrentUser = { ownerName: currentUser };
      
      const drawnWords = await drawnWordsCopy.find(onlyCurrentUser, { _id: 1, originHatTitle: 1}).sort({ date: -1 }).skip(skipCount).limit(limit);
      
      const totalItems = await drawnWordsCopy.countDocuments(onlyCurrentUser);
      const totalPages = Math.ceil(totalItems / limit);
      
      res.json({
        data: drawnWords,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    } catch (error) {
      console.error('Error retrieving hat themes:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

);

router.get('/get-list/:id', async (req, res) =>{
    try {
      const id = req.params.id;
      const drawnWords = await drawnWordsCopy.findOne({ _id: id});
      res.json(drawnWords);
    }catch (error) {
      console.error('Error retrieving drawn words:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
module.exports = router