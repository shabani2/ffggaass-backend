import express from 'express';
import Vente from '../Models/VenteSchema.js'; // Assurez-vous que le chemin est correct

const venteRouter = express.Router();

// Créer une nouvelle vente
venteRouter.post('/', async (req, res) => {
  try {
    const newVente = new Vente(req.body);
    const savedVente = await newVente.save();
    res.status(201).json(savedVente);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Obtenir toutes les ventes
venteRouter.get('/', async (req, res) => {
  try {
    const ventes = await Vente.find().populate('produit').populate('pointVente');
    res.status(200).json(ventes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rechercher des ventes par produit.nom
venteRouter.get('/search-by-produit', async (req, res) => {
  try {
    const { produitQuery } = req.query;

    const ventes = await Vente.find()
      .populate({
        path: 'produit',
        match: produitQuery ? { nom: { $regex: produitQuery, $options: 'i' } } : {},
      })
      .populate('pointVente');

    // Filtrer les ventes où le produit est trouvé
    const filteredVentes = ventes.filter(vente => vente.produit);

    res.status(200).json(filteredVentes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rechercher des ventes par pointVente.nom
venteRouter.get('/search-by-pointVente', async (req, res) => {
  try {
    const { pointVenteQuery } = req.query;

    const ventes = await Vente.find()
      .populate('produit')
      .populate({
        path: 'pointVente',
        match: pointVenteQuery ? { nom: { $regex: pointVenteQuery, $options: 'i' } } : {},
      });

    // Filtrer les ventes où le point de vente est trouvé
    const filteredVentes = ventes.filter(vente => vente.pointVente);

    res.status(200).json(filteredVentes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Obtenir une vente par ID
venteRouter.get('/:id', async (req, res) => {
  try {
    const vente = await Vente.findById(req.params.id).populate('produit').populate('pointVente');
    if (!vente) {
      return res.status(404).json({ message: 'Vente non trouvée' });
    }
    res.status(200).json(vente);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mettre à jour une vente par ID
venteRouter.put('/:id', async (req, res) => {
  try {
    const updatedVente = await Vente.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('produit').populate('pointVente');
    if (!updatedVente) {
      return res.status(404).json({ message: 'Vente non trouvée' });
    }
    res.status(200).json(updatedVente);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Supprimer une vente par ID
venteRouter.delete('/:id', async (req, res) => {
  try {
    const deletedVente = await Vente.findByIdAndDelete(req.params.id);
    if (!deletedVente) {
      return res.status(404).json({ message: 'Vente non trouvée' });
    }
    res.status(200).json({ message: 'Vente supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


venteRouter.get('/grouped-vente', async (req, res) => {
  try {
    const { pointVente, produit, dateStart, dateEnd } = req.query;

    if (!pointVente || !produit) {
      return res.status(400).json({ message: "Les paramètres 'pointVente' et 'produit' sont requis." });
    }

    // Construction de la condition de filtrage
    let matchCondition = {
      pointVente: mongoose.Types.ObjectId(pointVente),
      produit: mongoose.Types.ObjectId(produit),
    };

    // Ajout de la condition de date si fournie
    if (dateStart || dateEnd) {
      matchCondition.createdAt = {};
      if (dateStart) {
        matchCondition.createdAt.$gte = new Date(dateStart);
      }
      if (dateEnd) {
        matchCondition.createdAt.$lte = new Date(dateEnd);
      }
    }

    // Pipeline d'agrégation
    const result = await Vente.aggregate([
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
        $sort: { "_id.date": 1 }
      }
    ]);

    res.status(200).json(result);
  } catch (error) {
    console.error("Erreur lors de l'agrégation :", error);
    res.status(500).json({ message: error.message });
  }
});


export default venteRouter ;
