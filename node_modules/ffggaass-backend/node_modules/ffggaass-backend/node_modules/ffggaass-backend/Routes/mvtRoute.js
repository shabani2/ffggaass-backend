import express from 'express';
import asyncHandler from 'express-async-handler';
import MvtStock from '../Models/mvtStockSchema.js';
import Produit from '../Models/ProduitSchema.js';
import PointVente from '../Models/PointVenteSchema.js';

const mvtRoute = express.Router();

// Route pour créer un nouveau mvtStock
mvtRoute.post(
  '/',
  asyncHandler(async (req, res) => {
    const { operation, quantite, montant, statut, produitId, pointVenteId } = req.body;
    const produit = await Produit.findById(produitId);
    const pointVente = await PointVente.findById(pointVenteId);
    if (produit && pointVente) {
      const mvtStock = new MvtStock({ operation, quantite, montant, statut, produit: produit._id, pointVente: pointVente._id });
      const createdMvtStock = await mvtStock.save();
      res.status(201).json(createdMvtStock);
    } else {
      res.status(404).json({ message: 'Produit ou Point de vente non trouvé' });
    }
  })
);

// Route pour obtenir tous les mvtStocks
mvtRoute.get(
  '/',
  asyncHandler(async (req, res) => {
    const mvtStocks = await MvtStock.find({})
      .populate('produit', 'nom')
      .populate('pointVente', 'nom emplacement');
    res.json(mvtStocks);
  })
);

// mvtRoute.get(
//   '/',
//   asyncHandler(async (req, res) => {
//     const page = parseInt(req.query.page) || 0;
//     const pageSize = parseInt(req.query.pageSize) || 20;
    
//     const mvtStocks = await MvtStock.find({})
//       .skip(page * pageSize)
//       .limit(pageSize)
//       .populate('produit', 'nom')
//       .populate('pointVente', 'nom emplacement');
    
//     const total = await MvtStock.countDocuments();
    
//     res.json({ mvtStocks, total });
//   })
// );

// Route pour obtenir un mvtStock par ID
mvtRoute.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const mvtStock = await MvtStock.findById(req.params.id)
      .populate('produit', 'nom')
      .populate('pointVente', 'nom emplacement');
    if (mvtStock) {
      res.json(mvtStock);
    } else {
      res.status(404).json({ message: 'Mouvement de stock non trouvé' });
    }
  })
);

// Route pour mettre à jour un mvtStock par ID
mvtRoute.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const mvtStock = await MvtStock.findById(req.params.id);
    if (mvtStock) {
      mvtStock.operation = req.body.operation || mvtStock.operation;
      mvtStock.quantite = req.body.quantite || mvtStock.quantite;
      mvtStock.montant = req.body.montant || mvtStock.montant;
      mvtStock.statut = req.body.statut || mvtStock.statut;
      if (req.body.produitId) {
        const produit = await Produit.findById(req.body.produitId);
        if (produit) {
          mvtStock.produit = req.body.produitId;
        } else {
          res.status(404).json({ message: 'Produit non trouvé' });
          return;
        }
      }
      if (req.body.pointVenteId) {
        const pointVente = await PointVente.findById(req.body.pointVenteId);
        if (pointVente) {
          mvtStock.pointVente = req.body.pointVenteId;
        } else {
          res.status(404).json({ message: 'Point de vente non trouvé' });
          return;
        }
      }
      const updatedMvtStock = await mvtStock.save();
      res.json(updatedMvtStock);
    } else {
      res.status(404).json({ message: 'Mouvement de stock non trouvé' });
    }
  })
);

// Route pour supprimer un mvtStock par ID
mvtRoute.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const mvtStock = await MvtStock.findByIdAndDelete(req.params.id);
    if (mvtStock) {
      
      res.json({ message: 'Mouvement de stock supprimé' });
    } else {
      res.status(404).json({ message: 'Mouvement de stock non trouvé' });
    }
  })
);

//vendeur filtrage
mvtRoute.get(
  '/operation/filter',
  asyncHandler(async (req, res) => {
    const { operation, pointVenteNom } = req.query;

    let filter = {};

    if (operation) {
      filter.operation = operation;
    }

    if (pointVenteNom) {
      // Trouver les IDs des pointVentes correspondants au nom fourni
      const pointVentes = await PointVente.find({ nom: { $regex: pointVenteNom, $options: 'i' } });
      const pointVenteIds = pointVentes.map((pv) => pv._id);

      filter.pointVente = { $in: pointVenteIds };
    }

    const mvtStocks = await MvtStock.find(filter)
      .populate('produit', 'nom')
      .populate('pointVente', 'nom emplacement');

    res.json(mvtStocks);
  })
);


mvtRoute.get(
  '/vendeur/filter',
  asyncHandler(async (req, res) => {
    const { operation, pointVenteId } = req.query;

    let filter = {};

    if (operation) {
      filter.operation = operation;
    }

    if (pointVenteId) {
      filter.pointVente = pointVenteId;
    }

    try{
      const mvtStocks = await MvtStock.find(filter).populate('produit pointVente')
      res.json(mvtStocks);
    }catch (error) {
      res.status(500).json({ message: error.message });   
  }}
)
);

export default mvtRoute ;
