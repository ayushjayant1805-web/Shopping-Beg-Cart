const express = require('express');
const router = express.Router();
const ownerModel = require('../models/owner-model');

const normalizedEnv = (process.env.NODE_ENV || '').toLowerCase();
const isLegacyDevEnv = ['development', 'devlopement', 'developement'].includes(normalizedEnv);

router.post('/create', async function (req, res) {
  if (isLegacyDevEnv) {
    try {
      const owners = await ownerModel.find();
      if (owners.length > 0) {
        return res.status(503).send('You dont have permission to create a new owner');
      }
      let {fullname,email,password}= req.body;
      let createdOwner=await ownerModel.create({
        fullname,
        email,
        password,
       
      })
      return res.status(201).send(createdOwner);
    } catch (error) {
      return res.status(500).send('Server error');
    }
  }

  return res.send('heyy its working owner');
});

module.exports = router;