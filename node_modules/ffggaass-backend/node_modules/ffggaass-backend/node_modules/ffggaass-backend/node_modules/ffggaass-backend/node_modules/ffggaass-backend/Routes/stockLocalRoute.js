import express from 'express';
import StockLocal from '../Models/stockLocalSchema.js';

const stockLocalRouter = express.Router();

// CREATE - Ajouter une nouvelle entrée dans StockLocal
stockLocalRouter.post('/', async (req, res) => {
  try {
    const stockLocal = new StockLocal(req.body);
    await stockLocal.save();
    res.status(201).json(stockLocal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// READ - Récupérer toutes les entrées dans StockLocal
stockLocalRouter.get('/', async (req, res) => {
  try {
    const stocksLocals = await StockLocal.find().populate('produit');
    res.status(200).json(stocksLocals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// READ - Récupérer une entrée dans StockLocal par ID
stockLocalRouter.get('/:id', async (req, res) => {
  try {
    const stockLocal = await StockLocal.findById(req.params.id).populate('produit');
    if (!stockLocal) {
      return res.status(404).json({ message: 'StockLocal non trouvé' });
    }
    res.status(200).json(stockLocal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE - Mettre à jour une entrée dans StockLocal
stockLocalRouter.put('/:id', async (req, res) => {
  try {
    const stockLocal = await StockLocal.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('produit');
    if (!stockLocal) {
      return res.status(404).json({ message: 'StockLocal non trouvé' });
    }
    res.status(200).json(stockLocal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE - Supprimer une entrée dans StockLocal
stockLocalRouter.delete('/:id', async (req, res) => {
  try {
    const stockLocal = await StockLocal.findByIdAndDelete(req.params.id);
    if (!stockLocal) {
      return res.status(404).json({ message: 'StockLocal non trouvé' });
    }
    res.status(200).json({ message: 'StockLocal supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// READ - Filtrer les entrées dans StockLocal par produit
stockLocalRouter.get('/filter-by-produit/:produitId', async (req, res) => {
    try {
      const { produitId } = req.params;
      
      // Rechercher toutes les entrées où le produit correspond à produitId
      const stocksLocals = await StockLocal.find({ produit: produitId }).populate('produit');
  
      if (stocksLocals.length === 0) {
        return res.status(404).json({ message: 'Aucun stock trouvé pour ce produit' });
      }
  
      res.status(200).json(stocksLocals);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  

export default stockLocalRouter;
