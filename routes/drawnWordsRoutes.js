const express = require('express');
const router = express.Router();
const drawnWordsCopy = require('../models/DrawnWordsModel');
const {PAGE_LIMIT} = require('../constants');

router.post('/save', async (req, res) =>{
  try {
      const { ownerId, originHatTheme, items, lessonId } = req.body;
      let isFromLesson = false;
      if (lessonId != null){
        isFromLesson = true;
      }
      const newDrawnWords= new drawnWordsCopy({
          owner: ownerId,
          originHatTheme,
          isFromLesson: isFromLesson,
          lessonHatTheme: lessonId,
          items,
      });
      await newDrawnWords.save();
      res.status(200).send("List of words saved successfully");
  } catch (error) {
      console.error("Error saving drawn words:", error);
      res.status(500).send("Error saving drawn words");
  }
});

router.patch('/update/:id', async (req, res) =>{
  try {
      const { items } = req.body;
      const  drawnWordsId = req.params.id;

      const drawnWordsToUpdate = await drawnWordsCopy.findById(drawnWordsId);
      if (!drawnWordsToUpdate){
        return res.status(404).json({ message: "Drawn words not found" });
      }

      const updatedWords = await drawnWordsCopy.findByIdAndUpdate(drawnWordsId, {
        $set: { items : items , isDeleted : false}}, { new: true });

      res.status(200).send("List of words updated successfully");
  } catch (error) {
      console.error("Error saving drawn words:", error);
      res.status(500).send("Error saving drawn words");
  }
});

router.get('/my-drawn-list', async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = PAGE_LIMIT;
      const skipCount = (page - 1) * limit;
      const currentUser = req.query.userId;
      
      const onlyCurrentUser = { owner: currentUser, isDeleted: false};
      
      const drawnWords = await drawnWordsCopy.find(onlyCurrentUser, { _id: 1, originHatTheme: 1}).sort({ date: -1 }).skip(skipCount).limit(limit).populate('originHatTheme','title').lean();
      
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
      console.error('Error retrieving drawn words:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

router.get('/get-list/:id', async (req, res) =>{
  try {
    const id = req.params.id;
    const drawnWords = await drawnWordsCopy.findById(id).populate('originHatTheme', 'title').populate('lessonHatTheme', 'lessonName');
    if (!drawnWords) {
      return res.status(404).json({ message: "DrawnWords not found" });
    }

    if (drawnWords.isDeleted) {
      return res.status(400).json({ message: "The DrawnWords were deleted"});
    }

    res.json(drawnWords);
  }catch (error) {
    console.error('Error retrieving drawn words:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.patch('/delete/:id', async (req, res) => {
  try{
      const drawnWordsId = req.params.id;
      const drawnWords = await drawnWordsCopy.findById(drawnWordsId);
      if (!drawnWords) {
        return res.status(404).json({ message: "DrawnWords not found" });
      }

      if (drawnWords.isDeleted) {
        return res.status(400).json({ message: "The DrawnWords were already deleted"});
      }

      await drawnWordsCopy.findByIdAndUpdate(drawnWordsId, {
          $set: {isDeleted: true}
      });

      res.status(200).json({ message: "DrawnWords deleted successfully"})
  }catch(error){
      console.error("Error deleting DrawnWords", error);
      res.status(500).json({ message: "Server error" });
  }
});
  
module.exports = router;