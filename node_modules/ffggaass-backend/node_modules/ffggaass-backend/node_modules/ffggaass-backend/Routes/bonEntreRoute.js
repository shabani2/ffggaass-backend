import express from 'express';
import BonEntre from '../Models/bonEntreSchema.js'; // Correction du nom du modèle
import asyncHandler from 'express-async-handler';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx';
import multer from 'multer';
import Produit from '../Models/ProduitSchema.js';

const bonEntreRouter = express.Router();
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

// Route pour exporter les bons de réception
bonEntreRouter.get('/export', asyncHandler(async (req, res) => {
  const { format } = req.query; // format peut être 'csv' ou 'xlsx'

  // Récupérer les données de bon d'entrée avec les informations liées
  const bonsEntre = await BonEntre.find({})
    .populate('produit', 'nom');

  // Transformer les données en un format plus lisible pour l'export
  const data = bonsEntre.map(bon => ({
    quantite: bon.quantite,
    montant: bon.montant,
    produitNom: bon.produit.nom,
  }));

  // Créer un répertoire d'export s'il n'existe pas
  const exportDir = path.join(__dirname, 'export');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir);
  }

  const filePath = path.join(exportDir, `bonsEntre.${format}`);

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
  xlsx.utils.book_append_sheet(workbook, worksheet, 'BonsEntre');
  xlsx.writeFile(workbook, filePath);
};

// Route pour importer les bons de réception
bonEntreRouter.post('/import', upload.single('file'), asyncHandler(async (req, res) => {
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

      if (produit) {
        const newBonEntre = new BonEntre({
          quantite: record.quantite,
          montant: record.montant,
          produit: produit._id,
        });

        const savedBonEntre = await newBonEntre.save();
        importedData.push(savedBonEntre);
      }
    }

    // Supprimer le fichier uploadé après traitement
    fs.unlinkSync(filePath);

    res.status(200).json(importedData);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du traitement du fichier', error: error.message });
  }
}));

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
