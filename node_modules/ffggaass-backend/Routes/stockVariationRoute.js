import express from 'express';
import StockVariation from '../Models/stockVariationSchema.js';
import asyncHandler from 'express-async-handler';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx';
import multer from 'multer';
import Produit from '../Models/ProduitSchema.js';
import PointVente from '../Models/PointVenteSchema.js';


const variationRouter = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Configuration de multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

// Route pour exporter les variations de stock
variationRouter.get('/export', asyncHandler(async (req, res) => {
  const { format } = req.query; // format peut être 'csv' ou 'xlsx'

  // Récupérer les données de stock variation avec les informations liées
  const stockVariations = await StockVariation.find({})
    .populate('produit', 'nom')
    .populate('pointVente', 'nom emplacement');

  // Transformer les données en un format plus lisible pour l'export
  const data = stockVariations.map(stock => ({
    produitNom: stock.produit.nom,
    pointVenteNom: stock.pointVente.nom,
    pointVenteEmplacement: stock.pointVente.emplacement,
    quantiteLivre: stock.quantiteLivre,
    quantiteVendu: stock.quantiteVendu,
    solde: stock.solde,
  }));

  // Créer un répertoire d'export s'il n'existe pas
  const exportDir = path.join(__dirname, 'export');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir);
  }

  const filePath = path.join(exportDir, `stockVariations.${format}`);

  if (format === 'csv') {
    exportToCSV(data, filePath);
  } else if (format === 'xlsx') {
    exportToExcel(data, filePath);
  } else {
    return res.status(400).send('Format invalide');
  }

  res.download(filePath, (err) => {
    if (err) {
      res.status(500).send('Erreur lors du téléchargement du fichier');
    }
    fs.unlinkSync(filePath); // Supprime le fichier après téléchargement
  });
}));

// Fonctions utilitaires pour l'exportation
const exportToCSV = (data, filePath) => {
  const csv = data.map(row => Object.values(row).join(',')).join('\n');
  const header = Object.keys(data[0]).join(',');
  fs.writeFileSync(filePath, `${header}\n${csv}`);
};

const exportToExcel = (data, filePath) => {
  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'StockVariations');
  xlsx.writeFile(workbook, filePath);
};

// Route pour importer les variations de stock
variationRouter.post('/import', upload.single('file'), asyncHandler(async (req, res) => {
  try {
    const filePath = req.file.path;

    // Lire le fichier Excel
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const importedData = [];

    for (const record of data) {
      const produit = await Produit.findOne({ nom: record.produitNom });
      const pointVente = await PointVente.findOne({ nom: record.pointVenteNom });

      if (produit && pointVente) {
        const newStockVariation = new StockVariation({
          produit: produit._id,
          pointVente: pointVente._id,
          quantiteLivre: record.quantiteLivre,
          quantiteVendu: record.quantiteVendu,
          solde: record.quantiteLivre - record.quantiteVendu,
        });

        const savedStockVariation = await newStockVariation.save();
        importedData.push(savedStockVariation);
      }
    }

    // Supprimer le fichier uploadé après traitement
    fs.unlinkSync(filePath);

    res.status(200).json(importedData);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du traitement du fichier', error: error.message });
  }
}));

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



