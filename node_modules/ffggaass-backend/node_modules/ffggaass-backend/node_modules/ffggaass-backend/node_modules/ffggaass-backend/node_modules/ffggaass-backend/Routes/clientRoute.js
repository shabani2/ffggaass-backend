import express from 'express';
import Client from '../Models/ClientSchema.js'; // Assurez-vous que le chemin est correct

const ClientRouter = express.Router();

// Créer un nouveau client
ClientRouter.post('/', async (req, res) => {
  try {
    const newClient = new Client(req.body);
    const savedClient = await newClient.save();
    res.status(201).json(savedClient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Obtenir tous les clients
ClientRouter.get('/', async (req, res) => {
  try {
    const clients = await Client.find();
    res.status(200).json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rechercher des clients par nom, postnom ou prenom
ClientRouter.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const clients = await Client.find({
      $or: [
        { nom: { $regex: query, $options: 'i' } },
        { postnom: { $regex: query, $options: 'i' } },
        { prenom: { $regex: query, $options: 'i' } },
      ],
    });
    res.status(200).json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Obtenir un client par ID
ClientRouter.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    res.status(200).json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mettre à jour un client par ID
ClientRouter.put('/:id', async (req, res) => {
  try {
    const updatedClient = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedClient) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    res.status(200).json(updatedClient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Supprimer un client par ID
ClientRouter.delete('/:id', async (req, res) => {
  try {
    const deletedClient = await Client.findByIdAndDelete(req.params.id);
    if (!deletedClient) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    res.status(200).json({ message: 'Client supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default ClientRouter;
