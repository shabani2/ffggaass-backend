import express from 'express';
import asyncHandler from 'express-async-handler';
import PointVente from '../Models/PointVenteSchema.js';

const PointVenteRoute = express.Router();

// Route pour créer un nouveau point de vente
PointVenteRoute.post(
  '/',
  asyncHandler(async (req, res) => {
    const pointVente = new PointVente(req.body);
    const createdPointVente = await pointVente.save();
    res.status(201).json(createdPointVente);
  })
);

// Route pour obtenir tous les points de vente
PointVenteRoute.get(
  '/',
  asyncHandler(async (req, res) => {
    const pointsVente = await PointVente.find({});
    res.json(pointsVente);
  })
);

// Route pour obtenir un point de vente par ID
PointVenteRoute.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const pointVente = await PointVente.findById(req.params.id);
    if (pointVente) {
      res.json(pointVente);
    } else {
      res.status(404).json({ message: 'Point de vente non trouvé' });
    }
  })
);

// Route pour mettre à jour un point de vente par ID
PointVenteRoute.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const pointVente = await PointVente.findById(req.params.id);
    if (pointVente) {
      pointVente.nom = req.body.nom || pointVente.nom;
      pointVente.emplacement = req.body.emplacement || pointVente.emplacement;
      const updatedPointVente = await pointVente.save();
      res.json(updatedPointVente);
    } else {
      res.status(404).json({ message: 'Point de vente non trouvé' });
    }
  })
);

// Route pour supprimer un point de vente par ID
PointVenteRoute.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const pointVente = await PointVente.findByIdAndDelete(req.params.id);
    if (pointVente) {
      res.json({ message: 'Point de vente supprimé' });
    } else {
      res.status(404).json({ message: 'Point de vente non trouvé' });
    }
  })
);

export default PointVenteRoute;
