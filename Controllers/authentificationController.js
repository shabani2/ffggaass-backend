import expressAsyncHandler from "express-async-handler";
import mongoose from "mongoose";
import generateToken from "../Utils/generateToken.js";
import User from "../Models/UserSchema.js";
import json from "body-parser/lib/types/json.js";

export const register = expressAsyncHandler(async (req,res)=>{
   
    const { nom, postnom, prenom, numero, password, role, pointVenteId } = req.body;

    const existingUser = await User.findOne({ numero });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this number already exists.' });
    }

    const userData = {
      nom,
      postnom,
      prenom,
      numero,
      password,
      role,
      pointVenteId
    };

    // if (role === 'Vendeur') {
    //   userData.pointVente = pointVenteId;
    // }

    const newUser = new User(userData);
    await newUser.save();
    if(newUser){
        const token = generateToken(res,newUser._id)
        res.status(201).json({newUser,token})            
  
    }else{
        res.status(400)
        throw new Error('invalid data')
    }
})
    

export const login = expressAsyncHandler(async (req,res)=>{
    const {numero,password}=req.body
    const user = await User.findOne({numero})
    if(user &&  (await user.matchPassword(password))){
     
        const token = generateToken(res,user._id)
        res.status(200).json({ userId:user._id, token })
       
    }else{
        res.status(401)
        throw new Error('NUMERO or password invalid')
    }
    
})


export const loggedout = (req,res)=>{
    res.cookie('jwt','',{
        httpOnly : true,
        expires : new Date(0)
    })
    res.status(200).json({message:'you are logged out successfully'})
    
}

