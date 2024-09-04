import express from 'express';
import Livraison from '../Models/LivraisonSchema.js'; // Assurez-vous que le chemin est correct

const livraisonRouter = express.Router();

// Créer une nouvelle livraison
livraisonRouter.post('/', async (req, res) => {
  try {
    const newLivraison = new Livraison(req.body);
    const savedLivraison = await newLivraison.save();
    res.status(201).json(savedLivraison);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Obtenir toutes les livraisons (triées par createdAt en ordre décroissant)
livraisonRouter.get('/', async (req, res) => {
  try {
    const livraisons = await Livraison.find()
      .populate('produit')
      .populate('pointVente')
      .sort({ createdAt: -1 }); // Tri en ordre décroissant par createdAt
    res.status(200).json(livraisons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rechercher des livraisons par produit.nom (triées par createdAt en ordre décroissant)
livraisonRouter.get('/search-by-produit', async (req, res) => {
  try {
    const { produitQuery } = req.query;

    const livraisons = await Livraison.find()
      .populate({
        path: 'produit',
        match: produitQuery ? { nom: { $regex: produitQuery, $options: 'i' } } : {},
      })
      .populate('pointVente')
      .sort({ createdAt: -1 }); // Tri en ordre décroissant par createdAt

    const filteredLivraisons = livraisons.filter(livraison => livraison.produit);

    res.status(200).json(filteredLivraisons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rechercher des livraisons par pointVente.nom (triées par createdAt en ordre décroissant)
livraisonRouter.get('/search-by-pointVente', async (req, res) => {
  try {
    const { pointVenteQuery } = req.query;

    const livraisons = await Livraison.find()
      .populate('produit')
      .populate({
        path: 'pointVente',
        match: pointVenteQuery ? { nom: { $regex: pointVenteQuery, $options: 'i' } } : {},
      })
      .sort({ createdAt: -1 }); // Tri en ordre décroissant par createdAt

    const filteredLivraisons = livraisons.filter(livraison => livraison.pointVente);

    res.status(200).json(filteredLivraisons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Exclure les livraisons par pointVente.nom (triées par createdAt en ordre décroissant)
livraisonRouter.get('/exclude-by-pointVente', async (req, res) => {
  try {
    const { pointVenteQuery } = req.query;

    const livraisons = await Livraison.find()
      .populate('produit')
      .populate({
        path: 'pointVente',
        match: pointVenteQuery ? { nom: { $not: { $regex: pointVenteQuery, $options: 'i' } } } : {},
      })
      .sort({ createdAt: -1 }); // Tri en ordre décroissant par createdAt

    const filteredLivraisons = livraisons.filter(livraison => livraison.pointVente);

    res.status(200).json(filteredLivraisons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mettre à jour le statut d'une livraison par ID
livraisonRouter.put('/statut/:id/:statut', async (req, res) => {
  try {
    const { id, statut } = req.params;

    if (!statut) {
      return res.status(400).json({ message: 'Le statut est requis.' });
    }

    const updatedLivraison = await Livraison.findByIdAndUpdate(
      id,
      { statut },
      { new: true, runValidators: true }
    )
      .populate('produit')
      .populate('pointVente');

    if (!updatedLivraison) {
      return res.status(404).json({ message: 'Livraison non trouvée' });
    }

    res.status(200).json(updatedLivraison);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Obtenir une livraison par ID
livraisonRouter.get('/:id', async (req, res) => {
  try {
    const livraison = await Livraison.findById(req.params.id)
      .populate('produit')
      .populate('pointVente');
    if (!livraison) {
      return res.status(404).json({ message: 'Livraison non trouvée' });
    }
    res.status(200).json(livraison);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mettre à jour une livraison par ID
livraisonRouter.put('/:id', async (req, res) => {
  try {
    const updatedLivraison = await Livraison.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('produit')
      .populate('pointVente');
    if (!updatedLivraison) {
      return res.status(404).json({ message: 'Livraison non trouvée' });
    }
    res.status(200).json(updatedLivraison);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Supprimer une livraison par ID
livraisonRouter.delete('/:id', async (req, res) => {
  try {
    const deletedLivraison = await Livraison.findByIdAndDelete(req.params.id);
    if (!deletedLivraison) {
      return res.status(404).json({ message: 'Livraison non trouvée' });
    }
    res.status(200).json({ message: 'Livraison supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Grouped Livraisons avec tri par date décroissant
livraisonRouter.get('/grouped-livraisons', async (req, res) => {
  try {
    const { pointVente, produit, dateStart, dateEnd } = req.query;

    if (!pointVente || !produit) {
      return res.status(400).json({ message: "Les paramètres 'pointVente' et 'produit' sont requis." });
    }

    let matchCondition = {
      pointVente: mongoose.Types.ObjectId(pointVente),
      produit: mongoose.Types.ObjectId(produit),
    };

    if (dateStart || dateEnd) {
      matchCondition.createdAt = {};
      if (dateStart) {
        matchCondition.createdAt.$gte = new Date(dateStart);
      }
      if (dateEnd) {
        matchCondition.createdAt.$lte = new Date(dateEnd);
      }
    }

    const result = await Livraison.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: {
            pointVente: "$pointVente",
            produit: "$produit",
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            }
          },
          totalQuantite: { $sum: "$quantite" },
          totalMontant: { $sum: "$montant" },
          livraisons: { $push: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: 'produits',
          localField: '_id.produit',
          foreignField: '_id',
          as: 'produitDetails'
        }
      },
      {
        $lookup: {
          from: 'pointventes',
          localField: '_id.pointVente',
          foreignField: '_id',
          as: 'pointVenteDetails'
        }
      },
      {
        $sort: { "_id.date": -1 } // Tri par date en ordre décroissant
      }
    ]);

    res.status(200).json(result);
  } catch (error) {
    console.error("Erreur lors de l'agrégation :", error);
    res.status(500).json({ message: error.message });
  }
});

export default livraisonRouter;
