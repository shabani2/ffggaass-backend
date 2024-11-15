import express from 'express';
import asyncHandler from 'express-async-handler';
import Produit from '../Models/ProduitSchema.js';
import Category from '../Models/CategorySchema.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx';
import multer from 'multer';

const ProduitRoute = express.Router();

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


// Route pour exporter les produits
ProduitRoute.get('/export', asyncHandler(async (req, res) => {
  const { format } = req.query; // format peut être 'csv' ou 'xlsx'
  
  const produits = await Produit.find({}).populate('category', 'nom');
  
  const data = produits.map(produit => ({
    nom: produit.nom,
    prix: produit.prix,
    prixVente: produit.prixVente,
    categoryNom: produit.category?.nom
  }));
  
  const exportDir = path.join(__dirname, 'export');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir);
  }

  const filePath = path.join(exportDir, `produits.${format}`);
  
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
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Produits');
  xlsx.writeFile(workbook, filePath);
};

// Route pour importer les produits
ProduitRoute.post('/import', upload.single('file'), asyncHandler(async (req, res) => {
  try {
    const filePath = req.file.path;

    // Lire le fichier Excel
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Insérer les données dans la table Produit
    const importedData = [];
    for (const record of data) {
      const produit = new Produit({
        nom: record.nom,
        prix: record.prix,
        prixVente: record.prixVente || 0,
        category: await Category.findOne({ nom: record.categoryNom })?._id
      });
      const savedProduit = await produit.save();
      importedData.push(savedProduit);
    }

    // Supprimer le fichier uploadé après traitement
    fs.unlinkSync(filePath);

    res.status(200).json(importedData);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du traitement du fichier', error: error.message });
  }}));



// Route pour créer un nouveau produit
ProduitRoute.post(
  '/',
  asyncHandler(async (req, res) => {
    const { nom, prix,prixVente, categoryId } = req.body;
    const category = await Category.findById(categoryId);
    if (category) {
      const produit = new Produit({ nom, prix, prixVente,category: category._id });
      const createdProduit = await produit.save();
      res.status(201).json(createdProduit);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  })
);

// Route pour obtenir tous les produits
ProduitRoute.get(
  '/',
  asyncHandler(async (req, res) => {
    const produits = await Produit.find({}).populate('category', 'nom');
    res.json(produits);
  })
);

// Route pour obtenir un produit par ID
ProduitRoute.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const produit = await Produit.findById(req.params.id).populate('category', 'nom');
    if (produit) {
      res.json(produit);
    } else {
      res.status(404).json({ message: 'Produit not found' });
    }
  })
);

// Route pour mettre à jour un produit par ID
ProduitRoute.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const produit = await Produit.findById(req.params.id);
    if (produit) {
      produit.nom = req.body.nom || produit.nom;
      produit.prix = req.body.prix || produit.prix;
      produit.prixVente = req.body.prixVente || produit.prixVente;
      if (req.body.categoryId) {
        const category = await Category.findById(req.body.categoryId);
        if (category) {
          produit.category = req.body.categoryId;
        } else {
          res.status(404).json({ message: 'Category not found' });
          return;
        }
      }
      const updatedProduit = await produit.save();
      res.json(updatedProduit);
    } else {
      res.status(404).json({ message: 'Produit not found' });
    }
  })
);

// Route pour supprimer un produit par ID
ProduitRoute.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const produit = await Produit.findByIdAndDelete(req.params.id);
    if (produit) {      
      res.json({ message: 'Produit removed' });
    } else {
      res.status(404).json({ message: 'Produit not found' });
    }
  })
);



export default ProduitRoute;
