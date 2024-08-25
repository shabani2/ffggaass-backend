// aggregateRouter.js
import express from 'express';
import aggregateVente from '../Controllers/venteAggregation.js'; // Assurez-vous que le chemin est correct
import SituationVente from '../Models/SituationVenteSchema.js'; // Assurez-vous que le chemin est correct

const rvsVenteRoute = express.Router();

// Route pour effectuer l'agrégation et enregistrer les résultats
rvsVenteRoute.post('/aggregate-and-save', async (req, res) => {
  try {
    const { pointVente, produit, dateStart, dateEnd } = req.body;

    // Effectuer l'agrégation
    const aggregatedData = await aggregateVente(pointVente, produit, dateStart, dateEnd);

    // Enregistrer les données agrégées dans SituationLivraison
    await SituationLivraison.deleteMany({ // Supprimer les anciens enregistrements pour éviter les duplications
      date: { $in: aggregatedData.map(data => data.date) },
      produit: { $in: aggregatedData.map(data => data.produit) },
      pointVente: { $in: aggregatedData.map(data => data.pointVente) }
    });

    await SituationVente.insertMany(aggregatedData);

    res.status(201).json({ message: 'Données agrégées et enregistrées avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

rvsVenteRoute.get('/get-situations', async (req, res) => {
    try {
      const { date, produit, pointVente } = req.query;
  
      const query = {};
      if (date) query.date = date;
      if (produit) query.produit = produit;
      if (pointVente) query.pointVente = pointVente;
  
      const situations = await SituationVente.find(query)
        .populate('produit')   // Si vous souhaitez inclure les détails du produit
        .populate('pointVente'); // Si vous souhaitez inclure les détails du point de vente
  
      res.status(200).json(situations);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

//filtre par pv
rvsVenteRoute.get('/filter-by-pointVente', async (req, res) => {
    try {
      const { pointVenteId } = req.query;
  
      const situations = await SituationVente.find({ pointVente : pointVenteId })
        .populate('produit')
        .populate('pointVente');
  
      res.status(200).json(situations);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  rvsVenteRoute.get('/filter-not-by-pointVente', async (req, res) => {
    try {
      const { pointVenteId } = req.query; // Récupère pointVenteId depuis les paramètres de requête
      console.log('pointVenteId:', pointVenteId);
      
      // Trouve toutes les situations où pointVente est différent de pointVenteId
      const situations = await SituationVente.find({
        pointVente: { $ne: pointVenteId }
      })
      .populate('produit')
      .populate('pointVente');
      
      console.log('Situations trouvées=>', situations);
  
      res.status(200).json(situations);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

// Filtrer par produit
rvsVenteRoute.get('/filter-by-produit', async (req, res) => {
    try {
      const { produit } = req.query;
  
      const situations = await SituationVente.find({ produit })
        .populate('produit')
        .populate('pointVente');
  
      res.status(200).json(situations);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

export default rvsVenteRoute ;
