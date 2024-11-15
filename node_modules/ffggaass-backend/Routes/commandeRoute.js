import express from 'express';
import Commande from '../Models/CommandeSchema.js'; // Assurez-vous que le chemin est correct

const commandeRouter = express.Router();

// Créer une nouvelle commande
commandeRouter.post('/', async (req, res) => {
  try {
    const newCommande = new Commande(req.body);
    const savedCommande = await newCommande.save();
    res.status(201).json(savedCommande);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Obtenir toutes les commandes (triées par createdAt en ordre décroissant)
commandeRouter.get('/', async (req, res) => {
  try {
    const commandes = await Commande.find()
      .populate('produit')
      .populate('client')
      .sort({ createdAt: -1 }); // Tri par createdAt en ordre décroissant

    res.status(200).json(commandes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rechercher des commandes par produit.nom (avec tri par createdAt en ordre décroissant)
commandeRouter.get('/search-by-produit', async (req, res) => {
  try {
    const { produitQuery } = req.query;

    const commandes = await Commande.find()
      .populate({
        path: 'produit',
        match: produitQuery ? { nom: { $regex: produitQuery, $options: 'i' } } : {},
      })
      .populate('client')
      .sort({ createdAt: -1 }); // Tri par createdAt en ordre décroissant

    // Filtrer les commandes où le produit est trouvé
    const filteredCommandes = commandes.filter(commande => commande.produit);

    res.status(200).json(filteredCommandes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rechercher des commandes par client.nom/postnom/prenom/adresse (avec tri par createdAt en ordre décroissant)
commandeRouter.get('/search-by-client', async (req, res) => {
  try {
    const { clientQuery } = req.query;

    const commandes = await Commande.find()
      .populate('produit')
      .populate({
        path: 'client',
        match: clientQuery
          ? {
              $or: [
                { nom: { $regex: clientQuery, $options: 'i' } },
                { postnom: { $regex: clientQuery, $options: 'i' } },
                { prenom: { $regex: clientQuery, $options: 'i' } },
                { adresse: { $regex: clientQuery, $options: 'i' } },
              ],
            }
          : {},
      })
      .sort({ createdAt: -1 }); // Tri par createdAt en ordre décroissant

    // Filtrer les commandes où le client est trouvé
    const filteredCommandes = commandes.filter(commande => commande.client);

    res.status(200).json(filteredCommandes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Obtenir une commande par ID
commandeRouter.get('/:id', async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id).populate('produit').populate('client');
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    res.status(200).json(commande);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mettre à jour une commande par ID
commandeRouter.put('/:id', async (req, res) => {
  try {
    const updatedCommande = await Commande.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('produit').populate('client');
    if (!updatedCommande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    res.status(200).json(updatedCommande);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Supprimer une commande par ID
commandeRouter.delete('/:id', async (req, res) => {
  try {
    const deletedCommande = await Commande.findByIdAndDelete(req.params.id);
    if (!deletedCommande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    res.status(200).json({ message: 'Commande supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mise à jour du statut d'une commande par ID
commandeRouter.put('/statut/:id/:statut', async (req, res) => {
  try {
    const { id, statut } = req.params; // Récupération des paramètres de l'URL

    if (!statut) {
      return res.status(400).json({ message: 'Le statut est requis.' });
    }

    // Mise à jour de la commande avec le nouveau statut
    const updatedCommande = await Commande.findByIdAndUpdate(
      id,
      { statut },
      { new: true, runValidators: true }
    ).populate('produit').populate('client');

    if (!updatedCommande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    res.status(200).json(updatedCommande);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default commandeRouter;
