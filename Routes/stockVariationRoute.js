import express from 'express';
import StockVariation from '../Models/stockVariationSchema.js';

const variationRouter = express.Router();

// Route pour obtenir toutes les variations de stock
variationRouter.get('/', async (req, res) => {
  try {
    const variations = await StockVariation.find().populate('produit').populate('pointVente');
    res.status(200).json(variations);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des variations de stock', error });
  }
});

// Route pour filtrer les variations par point de vente
variationRouter.get('/:pointVenteId', async (req, res) => {
  const { pointVenteId } = req.params;
  try {
    const variations = await StockVariation.find({ pointVente: pointVenteId }).populate('produit').populate('pointVente');;
    if (variations.length === 0) {
      return res.status(404).json({ message: 'Aucune variation de stock trouvée pour ce point de vente.' });
    }
    res.status(200).json(variations);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des variations de stock par point de vente', error });
  }
});

// Route pour filtrer les variations par point de vente et produit
variationRouter.get('/pointVente/:pointVenteId/:produitId', async (req, res) => {
  const { pointVenteId, produitId } = req.params;
  try {
    const variation = await StockVariation.findOne({ pointVente: pointVenteId, produit: produitId }).populate('produit').populate('pointVente');;
    if (!variation) {
      return res.status(404).json({ message: 'Aucune variation de stock trouvée pour ce point de vente et produit.' });
    }
    res.status(200).json(variation);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des variations de stock par point de vente et produit', error });
  }
});


// Route pour obtenir le solde d'un produit dans un point de vente spécifique
variationRouter.get('/pointVente/:pointVenteId/:produitId/solde', async (req, res) => {
  const { pointVenteId, produitId } = req.params;

  try {
    // Trouver la variation de stock spécifique
    const variation = await StockVariation.findOne({
      pointVente: pointVenteId,
      produit: produitId
    }).select('solde'); // Sélectionner uniquement la propriété "solde"

    // Vérifier si la variation existe
    if (!variation) {
      return res.status(404).json({ message: 'Aucune variation de stock trouvée pour ce point de vente et produit.' });
    }

    // Retourner la valeur du solde
    res.status(200).json({ solde: variation.solde });
  } catch (error) {
    // Gérer les erreurs
    res.status(500).json({ message: 'Erreur lors de la récupération du solde', error });
  }
});



export default variationRouter;



