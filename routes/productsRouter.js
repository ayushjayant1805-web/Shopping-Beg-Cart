const express = require('express');
const router = express.Router();

router.get('/', function (req, res){
    res.send("heyy its working product");
})

module.exports = router;