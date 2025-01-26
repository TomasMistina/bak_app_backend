const express = require('express')
const router = express.Router()
const hatThemeCopy = require('../models/HatThemeModel')


router.post('/save', async (req, res) =>{
  const { ownerName, title, hats } = req.body;
  try {
      const newHatTheme = new hatThemeCopy({
          ownerName,
          title,
          hats
      });
      await newHatTheme.save();
      res.status(200).send("Hat theme saved successfully");
  } catch (error) {
      console.error("Error saving hat theme:", error);
      res.status(500).send("Error saving hat theme");
  }
})

router.put('/update/:id', async (req, res) =>{
    const id = req.params.id;
    const { ownerName, title, hats } = req.body;
    try {
        const newHatTheme = await hatThemeCopy.findByIdAndUpdate(
            { _id: id}, 
            { ownerName, title, hats},
            { new: true }
        );
        if (!newHatTheme) {
          return res.status(404).send('Hat theme not found');
        }
        res.status(200).send(newHatTheme);
    } catch (error) {
        console.error("Error saving hat theme:", error);
        res.status(500).send("Error updating hat theme");
    }
});

router.get('/browse', async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 4;
      const skipCount = (page - 1) * limit;
      const currentUser = req.query.username;

      const excludeCurrentUser = { ownerName: { $ne: currentUser } };

      const hatThemes = await hatThemeCopy.find(excludeCurrentUser, { _id: 1, title: 1, ownerName: 1 }).sort({ date: -1 }).skip(skipCount).limit(limit);
      
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
      const limit = 4;
      const skipCount = (page - 1) * limit;
      const currentUser = req.query.username;

      const onlyCurrentUser = { ownerName: currentUser };

      const hatThemes = await hatThemeCopy.find(onlyCurrentUser, { _id: 1, title: 1, ownerName: 1 }).sort({ date: -1 }).skip(skipCount).limit(limit);
      
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
    const hatThemes = await hatThemeCopy.findOne({ _id: id});
    res.json(hatThemes);
  }catch (error) {
    console.error('Error retrieving hat theme:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router