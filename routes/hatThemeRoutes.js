const express = require('express');
const router = express.Router();
const hatThemeCopy = require('../models/HatThemeModel');
const User = require('../models/UserModel');
const mongoose = require('mongoose');
const {PAGE_LIMIT} = require('../constants');

router.post('/save', async (req, res) =>{
  try {
    const { ownerId, title, hats } = req.body;

    if (!ownerId || !title || !hats) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    const newHatTheme = new hatThemeCopy({
        owner: ownerId,
        title,
        hats
    });
    await newHatTheme.save();
    res.status(200).json({ message: "Hat theme saved successfully" });
  } catch (error) {
      console.error("Error saving hat theme:", error);
      res.status(500).json({ message:"Server error" });
  }
})

router.put('/update/:id', async (req, res) =>{
  try {
    const id = req.params.id;
    const { ownerId, title, hats } = req.body;

    if (!ownerId || !title || !hats) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const currentHatTheme = await hatThemeCopy.findById(id);
    if (!currentHatTheme) {
      return res.status(404).send('Hat theme not found');
    }

    if (currentHatTheme.isDeleted) {
      return res.status(400).json({ message: "The HatTheme was deleted"});
    }

    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    const newHatTheme = await hatThemeCopy.findByIdAndUpdate(
        id, 
        { owner: ownerId, title, hats},
        { new: true }
    );
      
    res.status(200).json({message: "Successfully updated", data: newHatTheme});
  } catch (error) {
      console.error("Error saving hat theme:", error);
      res.status(500).json({ message: "Server error" });
  }
});

router.post('/copy/:id', async (req, res) =>{
  try {
    const originalHatid = req.params.id;
    const ownerId = req.body.userId;

    if (!ownerId) {
      return res.status(400).json({ message: "Missing ownerId" });
    }

    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    const originalHat = await hatThemeCopy.findById(originalHatid);
    if (!originalHat){
      return res.status(404).json({ message: "Original HatTheme not found" });
    }

    if (originalHat.isDeleted) {
      return res.status(400).json({ message: "Cannot copy a deleted HatTheme" });
    }

    //TODO opravit sposob ako sa vytvara klobuk a ako sa taha z klobuku(dat prec id z itemov, staci _id)
    const copiedHats = originalHat.hats.map(hat => ({
      items: hat.items.map(item => ({ ...item._doc, id: new mongoose.Types.ObjectId() }))
    }));

    const newHatTheme = new hatThemeCopy({
        owner: ownerId,
        title: `${originalHat.title} (Skopírovaný)`,
        hats: copiedHats,
        wasCopied: true,
        copiedFrom: originalHatid
    });
    await newHatTheme.save();
    res.status(201).json({ message: "Hat theme copied successfully" });
  } catch (error) {
      console.error("Error copying hat theme:", error);
      res.status(500).json({ message:"Server error" });
  }
})

router.get('/browse', async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = PAGE_LIMIT;
      const skipCount = (page - 1) * limit;
      const currentUser = req.query.username;

      const user = await User.findOne({ username: currentUser });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const excludeCurrentUser = { owner: { $ne: user._id }, isDeleted: false, isPublic: true };

      const hatThemes = await hatThemeCopy.find(excludeCurrentUser, { _id: 1, title: 1, owner: 1 }).sort({ date: -1 }).skip(skipCount).limit(limit).populate('owner','username');
      const totalItems = await hatThemeCopy.countDocuments(excludeCurrentUser);
      const totalPages = Math.ceil(totalItems / limit);
      res.json({
            data: hatThemes,
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
  });

router.get('/my-hats', async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = PAGE_LIMIT;
      const skipCount = (page - 1) * limit;
      const currentUser = req.query.username;

      const user = await User.findOne({ username: currentUser });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const onlyCurrentUser = { owner: user._id, isDeleted: false};

      const hatThemes = await hatThemeCopy.find(onlyCurrentUser, { _id: 1, title: 1, owner: 1 }).sort({ date: -1 }).skip(skipCount).limit(limit);
      
      const totalItems = await hatThemeCopy.countDocuments(onlyCurrentUser);
      const totalPages = Math.ceil(totalItems / limit);

      res.json({
            data: hatThemes,
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
  });

  router.get('/select-from-my-hats', async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = PAGE_LIMIT;
      const skipCount = (page - 1) * limit;
      const currentUser = req.query.username;

      const user = await User.findOne({ username: currentUser });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const onlyCurrentUser = { owner: user._id, isDeleted: false, isPublic: true};

      const hatThemes = await hatThemeCopy.find(onlyCurrentUser, { _id: 1, title: 1, owner: 1 }).sort({ date: -1 }).skip(skipCount).limit(limit);
      
      const totalItems = await hatThemeCopy.countDocuments(onlyCurrentUser);
      const totalPages = Math.ceil(totalItems / limit);

      res.json({
            data: hatThemes,
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
  });

router.get('/get-hat/:id', async (req, res) =>{
  try {
    const id = req.params.id;
    const userId = req.query.userId;
    const hatThemes = await hatThemeCopy.findById(id).populate();
    if (!hatThemes) {
      return res.status(404).json({ message: "HatTheme not found" });
    }

    if (hatThemes.isDeleted) {
      return res.status(400).json({ message: "The HatTheme was deleted"});
    }

    if (!hatThemes.isPublic && (hatThemes.owner._id.toString() != userId)){
      return res.status(403).json({ message: "This HatTheme is private"});
    }

    res.json(hatThemes);
  }catch (error) {
    console.error('Error retrieving hat theme:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.patch('/delete/:id', async (req, res) => {
  try{
      const hatThemeId = req.params.id;
      const HatTheme = await hatThemeCopy.findById(hatThemeId);
      if (!HatTheme) {
          return res.status(404).json({ message: "HatTheme not found" });
      }

      if (HatTheme.isDeleted) {
          return res.status(400).json({ message: "The HatTheme was already deleted"});
      }

      await hatThemeCopy.findByIdAndUpdate(hatThemeId, {
          $set: {isDeleted: true}
      });
      res.status(200).json({ message: "HatTheme deleted successfully"})
  }catch(error){
      console.error("Error deleting HatTheme", error);
      res.status(500).json({ message: "Server error" });
  }
});

router.patch('/toggle-visibility/:id', async (req, res) => {
  try {
    const hatThemeId = req.params.id;
    const { makePublic } = req.body;

    const hatTheme = await hatThemeCopy.findById(hatThemeId);
    if (!hatTheme) {
      return res.status(404).json({ message: "Hat theme not found" });
    }

    if (hatTheme.isDeleted) {
      return res.status(400).json({ message: "Hat theme was deleted" });
    }

    if (hatTheme.isPublic === makePublic) {
      return res.status(400).json({     
        message: `Hat theme is already ${makePublic ? 'public' : 'private'}` 
      });
    }

    await hatThemeCopy.findByIdAndUpdate(hatThemeId, {
      $set: { isPublic: makePublic },
    });

    res.status(200).json({ 
      message: `Hat theme made ${makePublic ? 'public' : 'private'} successfully` 
    });
  } catch (error) {
    console.error("Error while toggling Hat theme visibility", error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;