const userModel=require("../models/user-model")
const bcrypt= require('bcrypt');
const jwt=require("jsonwebtoken")
const {genrateToken}=require("../utils/genrateToken")

module.exports.registerUser =  function(req, res){
 try{
      let {email, fullname, password} = req.body;

      bcrypt.genSalt(10, function (err, salt){
        bcrypt.hash(password, salt , async function(err, hash){
            if(err) return res.send(err.message);
            else {
                    let user= await userModel.create({
                    email,
                    password: hash,
                    fullname,
   });

   let token= genrateToken(user);
    res.cookie("token",token);
    res.send("User created successfully");
        }
      });
     });
   }catch(err){
    console.log(err.message);
   
  }

 };


 module.exports.loginUser = async function (req, res) {
  let {email, password}=req.body;

  let user= userModel.findOne({email: email});
  if(!user) return res.send("Email or password incorrect")
 
 bcrypt.compare(password, user.password, function(err, result){
  res.send(result);
 })
  }