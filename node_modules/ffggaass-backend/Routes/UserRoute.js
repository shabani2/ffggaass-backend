import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../Models/UserSchema.js';

const userRoute = express.Router();

// Create a new user
userRoute.post(
  '/',
  asyncHandler(async (req, res) => {
    const { nom, postnom, prenom, numero, password, role, pointVente } = req.body;
    const user = new User({ nom, postnom, prenom, numero, password, role, pointVente });
    await user.save();
    res.status(201).json(user);
  })
);

// Read all users
userRoute.get(
  '/',
  asyncHandler(async (req, res) => {
    const users = await User.find().populate('pointVente');
    res.json(users);
  })
);

// Read a single user by ID
userRoute.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).populate('pointVente');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  })
);

// Update a user by ID
userRoute.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { nom, postnom, prenom, numero, password, role, pointVente } = req.body;
    const user = await User.findById(req.params.id);
    if (user) {
      user.nom = nom || user.nom;
      user.postnom = postnom || user.postnom;
      user.prenom = prenom || user.prenom;
      user.numero = numero || user.numero;
      user.password = password || user.password;
      user.role = role || user.role;
      user.pointVente = pointVente || user.pointVente;
      await user.save();
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  })
);

// Delete a user by ID
userRoute.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (user) {
      
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  })
);

export default userRoute;
