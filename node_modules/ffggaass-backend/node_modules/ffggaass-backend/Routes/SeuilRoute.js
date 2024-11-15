import express from 'express';
import asyncHandler from 'express-async-handler';
import Seuil from '../Models/SeuilSchema.js';
import Produit from '../Models/ProduitSchema.js';
//import PointVente from '../Models/PointVenteSchema.js';

const SeuilRoute = express.Router();

// Route pour créer un nouveau seuil
SeuilRoute.post(
  '/',
  asyncHandler(async (req, res) => {
    const { quantite, produitId} = req.body;
    const produit = await Produit.findById(produitId);   
    if (produit ) {
      const seuil = new Seuil({ quantite, produit: produit._id});
      const createdSeuil = await seuil.save();
      res.status(201).json(createdSeuil);
    } else {
      res.status(404).json({ message: 'Produit ou Point de vente non trouvé' });
    }
  })
);

// Route pour obtenir tous les seuils
SeuilRoute.get(
  '/',
  asyncHandler(async (req, res) => {
    const seuils = await Seuil.find({})
      .populate('produit', 'nom')
      
    res.json(seuils);
  })
);

// Route pour obtenir un seuil par ID
SeuilRoute.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const seuil = await Seuil.findById(req.params.id)
      .populate('produit', 'nom')
    
    if (seuil) {
      res.json(seuil);
    } else {
      res.status(404).json({ message: 'Seuil non trouvé' });
    }
  })
);

// Route pour mettre à jour un seuil par ID
SeuilRoute.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const seuil = await Seuil.findById(req.params.id);
    if (seuil) {
      seuil.quantite = req.body.quantite || seuil.quantite;
      if (req.body.produitId) {
        const produit = await Produit.findById(req.body.produitId);
        if (produit) {
          seuil.produit = req.body.produitId;
        } else {
          res.status(404).json({ message: 'Produit non trouvé' });
          return;
        }
      }
      const updatedSeuil = await seuil.save();
      res.json(updatedSeuil);
    } else {
      res.status(404).json({ message: 'Seuil non trouvé' });
    }
  })
);

// Route pour supprimer un seuil par ID
SeuilRoute.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const seuil = await Seuil.findByIdAndDelete(req.params.id);
    if (seuil) {     
      res.json({ message: 'Seuil supprimé' });
    } else {
      res.status(404).json({ message: 'Seuil non trouvé' });
    }
  })
);

export default SeuilRoute;
