

// export default fileRouter;
import express from 'express';
import asyncHandler from 'express-async-handler';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx';
import multer from 'multer';
import MvtStock from '../Models/mvtStockSchema.js'; // Assurez-vous d'importer votre modèle correctement
import Produit from '../Models/ProduitSchema.js';
import PointVente from '../Models/PointVenteSchema.js';

const fileRouter = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



fileRouter.get('/mvtstock/export', asyncHandler(async (req, res) => {
  const { format } = req.query; // format can be 'csv' or 'xlsx'
  
  const mvtStocks = await MvtStock.find({})
    .populate('produit', 'nom')
    .populate('pointVente', 'nom emplacement');
  
  const data = mvtStocks.map(stock => ({
    operation: stock.operation,
    quantite: stock.quantite,
    montant: stock.montant,
    statut: stock.statut,
    produitNom: stock.produit.nom,
    pointVenteNom: stock.pointVente.nom,
  }));
  
  const exportDir = path.join(__dirname, 'export');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir);
  }

  const filePath = path.join(exportDir, `mvtStock.${format}`);
  
  if (format === 'csv') {
    exportToCSV(data, filePath);
  } else if (format === 'xlsx') {
    exportToExcel(data, filePath);
  } else {
    return res.status(400).send('Invalid format');
  }

  res.download(filePath, (err) => {
    if (err) {
      res.status(500).send('Error downloading the file');
    }
    fs.unlinkSync(filePath); // Remove the file after download
  });
}));

const exportToCSV = (data, filePath) => {
  const csv = data.map(row => Object.values(row).join(',')).join('\n');
  const header = Object.keys(data[0]).join(',');
  fs.writeFileSync(filePath, `${header}\n${csv}`);
};

const exportToExcel = (data, filePath) => {
  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'MvtStock');
  xlsx.writeFile(workbook, filePath);
};


//code pour importer le fichier mvtStock avec plus de donnees


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

  fileRouter.post('/mvtstock/import', upload.single('file'), asyncHandler(async (req, res) => {
    try {
      const filePath = req.file.path;
  
      // Lire le fichier Excel
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);
  
      // Insérer les données dans la table MvtStock
      const importedData = [];
      for (const record of data) {
        const produit = await Produit.findOne({ nom: record.produitNom });
        const pointVente = await PointVente.findOne({ nom: record.pointVenteNom });
  
        if (produit && pointVente) {
          const newMvtStock = new MvtStock({
            operation: record.operation,
            quantite: record.quantite,
            montant: record.montant,
            statut: record.statut,
            produit: produit._id,
            pointVente: pointVente._id,
          });
          const savedMvtStock = await newMvtStock.save();
          importedData.push(savedMvtStock);
        }
      }
  
      // Supprimer le fichier uploadé après traitement
      fs.unlinkSync(filePath);
  
      res.status(200).json(importedData);
    } catch (error) {
      res.status(500).json({ message: 'Error processing file', error: error.message });
    }
  }));

export default fileRouter;

