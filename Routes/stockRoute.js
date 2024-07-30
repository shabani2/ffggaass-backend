import express from 'express';
import asyncHandler from 'express-async-handler';
import Stock from '../Models/StockSchema.js';
import Produit from '../Models/ProduitSchema.js';
import PointVente from '../Models/PointVenteSchema.js';

const stockRoute = express.Router();

// Route pour créer un nouveau stock
stockRoute.post(
  '/',
  asyncHandler(async (req, res) => {
    const { operation, quantite, montant, produitId, pointVenteId } = req.body;
    const produit = await Produit.findById(produitId);
    const pointVente = await PointVente.findById(pointVenteId);
    if (produit && pointVente) {
      const stock = new Stock({ operation, quantite, montant, produit: produit._id, pointVente: pointVente._id });
      const createdStock = await stock.save();
      res.status(201).json(createdStock);
    } else {
      res.status(404).json({ message: 'Produit ou Point de vente non trouvé' });
    }
  })
);

// Route pour obtenir tous les stocks
stockRoute.get(
  '/',
  asyncHandler(async (req, res) => {
    const stocks = await Stock.find({})
      .populate('produit', 'nom')
      .populate('pointVente', 'nom emplacement');
    res.json(stocks);
  })
);

// Route pour obtenir un stock par ID
stockRoute.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const stock = await Stock.findById(req.params.id)
      .populate('produit', 'nom')
      .populate('pointVente', 'nom emplacement');
    if (stock) {
      res.json(stock);
    } else {
      res.status(404).json({ message: 'Stock non trouvé' });
    }
  })
);

// Route pour mettre à jour un stock par ID
stockRoute.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const stock = await Stock.findById(req.params.id);
    if (stock) {
      stock.operation = req.body.operation || stock.operation;
      stock.quantite = req.body.quantite || stock.quantite;
      stock.montant = req.body.montant || stock.montant;
      if (req.body.produitId) {
        const produit = await Produit.findById(req.body.produitId);
        if (produit) {
          stock.produit = req.body.produitId;
        } else {
          res.status(404).json({ message: 'Produit non trouvé' });
          return;
        }
      }
      if (req.body.pointVenteId) {
        const pointVente = await PointVente.findById(req.body.pointVenteId);
        if (pointVente) {
          stock.pointVente = req.body.pointVenteId;
        } else {
          res.status(404).json({ message: 'Point de vente non trouvé' });
          return;
        }
      }
      const updatedStock = await stock.save();
      res.json(updatedStock);
    } else {
      res.status(404).json({ message: 'Stock non trouvé' });
    }
  })
);

// Route pour supprimer un stock par ID
stockRoute.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const stock = await Stock.findByIdAndDelete(req.params.id);
    if (stock) {
      
      res.json({ message: 'Stock supprimé' });
    } else {
      res.status(404).json({ message: 'Stock non trouvé' });
    }
  })
);

export default stockRoute;
