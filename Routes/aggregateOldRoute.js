import express from 'express';
import { aggregateAndSave } from '../cron.js'; // Assurez-vous que le chemin est correct
import { aggregateAndSaveVente } from '../cronVente.js';
import Livraison from '../Models/LivraisonSchema.js'
import SituationLivraison from '../Models/SituationLivraisonSchema.js'

import SituationVente from '../Models/SituationVenteSchema.js'; // Assurez-vous du chemin correct
import Vente from '../Models/VenteSchema.js'

const groupBy = express.Router();

// Route pour traiter les anciennes données manuellement
groupBy.post('/process-Livraison', async (req, res) => {
  try {
    // Récupération des données à partir de la collection Livraison
    const livraisons = await Livraison.aggregate([
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            produit: "$produit",
            pointVente: "$pointVente",
          },
          quantiteTotale: { $sum: "$quantite" },
          montantTotal: { $sum: "$montant" }
        }
      }
    ]);

    console.log('Données agrégées : ', livraisons); // Log des données agrégées

    if (livraisons.length > 0) {
      // Insérer les données agrégées dans SituationLivraison
      const result = await SituationLivraison.insertMany(livraisons.map(item => ({
        date: item._id.date,
        produit: item._id.produit,
        pointVente: item._id.pointVente,
        quantiteTotale: item.quantiteTotale,
        montantTotal: item.montantTotal,
      })));

      console.log('Résultat de l\'insertion : ', result); // Log du résultat de l'insertion

      res.status(200).json({ message: 'Données traitées et enregistrées avec succès.' });
    } else {
      res.status(204).json({ message: 'Aucune donnée à traiter.' });
    }
  } catch (err) {
    console.error('Erreur lors du traitement des livraisons : ', err); // Log de l'erreur
    res.status(500).json({ message: 'Erreur serveur lors du traitement des livraisons.' });
  }
});

groupBy.post('/process-Vente', async (req, res) => {
  try {
    // Récupération des données à partir de la collection Livraison
    const ventes = await Vente.aggregate([
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            produit: "$produit",
            pointVente: "$pointVente",
          },
          quantiteTotale: { $sum: "$quantite" },
          montantTotal: { $sum: "$montant" }
        }
      }
    ]);

    console.log('Données agrégées : ', ventes); // Log des données agrégées

    if (ventes.length > 0) {
      // Insérer les données agrégées dans SituationLivraison
      const result = await SituationVente.insertMany(ventes.map(item => ({
        date: item._id.date,
        produit: item._id.produit,
        pointVente: item._id.pointVente,
        quantiteTotale: item.quantiteTotale,
        montantTotal: item.montantTotal,
      })));

      console.log('Résultat de l\'insertion : ', result); // Log du résultat de l'insertion

      res.status(200).json({ message: 'Données traitées et enregistrées avec succès.' });
    } else {
      res.status(204).json({ message: 'Aucune donnée à traiter.' });
    }
  } catch (err) {
    console.error('Erreur lors du traitement des livraisons : ', err); // Log de l'erreur
    res.status(500).json({ message: 'Erreur serveur lors du traitement des livraisons.' });
  }
  });

export default groupBy;
