import express from 'express';
import BonEntre from '../Models/bonEntreSchema.js'; // Correction du nom du modèle

const bonEntreRouter = express.Router();

// CREATE - Ajouter un nouveau bon d'entrée
bonEntreRouter.post('/', async (req, res) => {
  try {
    const newBonEntre = new BonEntre(req.body);
    await newBonEntre.save();
    res.status(201).json(newBonEntre);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// READ - Récupérer tous les bons d'entrée (triés par createdAt en ordre décroissant)
bonEntreRouter.get('/', async (req, res) => {
  try {
    const bonsEntres = await BonEntre.find()
      .populate('produit')
      .sort({ createdAt: -1 }); // Tri par createdAt en ordre décroissant
    res.status(200).json(bonsEntres);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// READ - Récupérer un bon d'entrée par ID
bonEntreRouter.get('/:id', async (req, res) => {
  try {
    const bonEntre = await BonEntre.findById(req.params.id).populate('produit');
    if (!bonEntre) {
      return res.status(404).json({ message: 'Bon d\'entrée non trouvé' });
    }
    res.status(200).json(bonEntre);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE - Mettre à jour un bon d'entrée
bonEntreRouter.put('/:id', async (req, res) => {
  try {
    const updatedBonEntre = await BonEntre.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('produit');
    if (!updatedBonEntre) {
      return res.status(404).json({ message: 'Bon d\'entrée non trouvé' });
    }
    res.status(200).json(updatedBonEntre);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE - Supprimer un bon d'entrée
bonEntreRouter.delete('/:id', async (req, res) => {
  try {
    const deletedBonEntre = await BonEntre.findByIdAndDelete(req.params.id);
    if (!deletedBonEntre) {
      return res.status(404).json({ message: 'Bon d\'entrée non trouvé' });
    }
    res.status(200).json({ message: 'Bon d\'entrée supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default bonEntreRouter;
