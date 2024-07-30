import express from 'express';
import asyncHandler from 'express-async-handler';
import Produit from '../Models/ProduitSchema.js';
import Category from '../Models/CategorySchema.js';

const ProduitRoute = express.Router();

// Route pour créer un nouveau produit
ProduitRoute.post(
  '/',
  asyncHandler(async (req, res) => {
    const { nom, prix,prixVente, categoryId } = req.body;
    const category = await Category.findById(categoryId);
    if (category) {
      const produit = new Produit({ nom, prix, prixVente,category: category._id });
      const createdProduit = await produit.save();
      res.status(201).json(createdProduit);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  })
);

// Route pour obtenir tous les produits
ProduitRoute.get(
  '/',
  asyncHandler(async (req, res) => {
    const produits = await Produit.find({}).populate('category', 'nom');
    res.json(produits);
  })
);

// Route pour obtenir un produit par ID
ProduitRoute.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const produit = await Produit.findById(req.params.id).populate('category', 'nom');
    if (produit) {
      res.json(produit);
    } else {
      res.status(404).json({ message: 'Produit not found' });
    }
  })
);

// Route pour mettre à jour un produit par ID
ProduitRoute.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const produit = await Produit.findById(req.params.id);
    if (produit) {
      produit.nom = req.body.nom || produit.nom;
      produit.prix = req.body.prix || produit.prix;
      produit.prixVente = req.body.prixVente || produit.prixVente;
      if (req.body.categoryId) {
        const category = await Category.findById(req.body.categoryId);
        if (category) {
          produit.category = req.body.categoryId;
        } else {
          res.status(404).json({ message: 'Category not found' });
          return;
        }
      }
      const updatedProduit = await produit.save();
      res.json(updatedProduit);
    } else {
      res.status(404).json({ message: 'Produit not found' });
    }
  })
);

// Route pour supprimer un produit par ID
ProduitRoute.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const produit = await Produit.findByIdAndDelete(req.params.id);
    if (produit) {      
      res.json({ message: 'Produit removed' });
    } else {
      res.status(404).json({ message: 'Produit not found' });
    }
  })
);

export default ProduitRoute;
