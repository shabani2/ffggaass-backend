import express from 'express';
import PDFDocument from 'pdfkit'; // Bibliothèque pour la génération de PDF
//import Vente from '../Models/VentesSchema.js'; // Modèle Vente
import Produit from '../Models/ProduitSchema.js' // Modèle Produit
import Vente from '../Models/VenteSchema.js'; // Assurez-vous que le chemin est correct


const pdfGeneratorRouter = express.Router();

// pdfGeneratorRouter.post('/facture', async (req, res) => {
//   try {
//     const { client, ventes } = req.body; // On reçoit une liste de ventes et les détails du client

//     // Vérification de la validité des paramètres
//     if (!client || !ventes || ventes.length === 0) {
//       return res.status(400).json({ message: "Client et ventes sont requis." });
//     }

//     // Récupérer les détails de chaque vente
//     const ventesDetails = await Promise.all(
//       ventes.map(async (venteId) => {
//         // Récupérer chaque vente par son ID et peupler les détails du produit
//         const vente = await Vente.findById(venteId).populate('produit').exec();
//         if (!vente) {
//           throw new Error(`Vente avec l'ID ${venteId} non trouvée`);
//         }
//         return {
//           produit: vente.produit,  // L'objet produit récupéré via `populate`
//           quantite: vente.quantite,
//           montant: vente.montant,
//         };
//       })
//     );

//     // Créer un nouveau document PDF
//     const doc = new PDFDocument({ margin: 50 });

//     // Configurer les en-têtes HTTP pour indiquer qu'il s'agit d'un PDF
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', 'attachment; filename=facture.pdf');

//     // Créez un flux de réponse PDF
//     doc.pipe(res);

//     // Ajouter l'en-tête de la facture
//     doc.fontSize(18).text('Facture', { align: 'center' });
//     doc.moveDown();

//     // Informations sur l'entreprise
//     doc.fontSize(12).text('FFGGAASS Agraca Solution', { align: 'left' });
//     doc.text('Adresse: Commune de la Gombe', { align: 'left' });
//     doc.text(`Date: ${new Date().toLocaleString()}`, { align: 'left' });
//     doc.moveDown(2);

//     // Informations sur le client
//     doc.fontSize(14).text('Détails du client :');
//     doc.fontSize(12).text(`Nom : ${client.nom}`);
//     doc.text(`Adresse : ${client.adresse}`);
//     doc.text(`Numéro : ${client.numero}`);
//     doc.moveDown(1.5);

//     // Titre pour les produits vendus
//     doc.fontSize(14).text('Détails des produits vendus :', { underline: true });
//     doc.moveDown(0.5);

//     // Variables pour calculer le total général
//     let totalGeneral = 0;

//     // Détails des ventes
//     ventesDetails.forEach((vente) => {
//       const produit = vente.produit;
//       const quantite = vente.quantite;
//       const montant = vente.montant;

//       // Afficher les détails de chaque produit vendu
//       doc.fontSize(12).text(`${produit.nom} - fc: ${produit.prixVente} x ${quantite} = fc: ${montant}`);

//       // Ajouter le montant au total général
//       totalGeneral += montant;
//     });

//     doc.moveDown(1.5);

//     // Afficher le montant total
//     doc.fontSize(14).text(`Montant Total : fc ${totalGeneral}`, { align: 'right', bold: true });
//     doc.moveDown(2);

//     // Remerciement
//     doc.fontSize(12).text('Merci pour votre achat !', { align: 'center' });

//     // Terminer et envoyer le document
//     doc.end();

//   } catch (error) {
//     console.error('Erreur lors de la génération de la facture PDF :', error);
//     res.status(500).json({ message: "Erreur lors de la génération de la facture PDF." });
//   }
// });




pdfGeneratorRouter.post('/facture', async (req, res) => {
  try {
    const { client, ventes } = req.body;

    if (!client || !ventes || ventes.length === 0) {
      return res.status(400).json({ message: "Client et ventes sont requis." });
    }

    const ventesDetails = await Promise.all(
      ventes.map(async (venteId) => {
        const vente = await Vente.findById(venteId).populate('produit').exec();
        if (!vente) {
          throw new Error(`Vente avec l'ID ${venteId} non trouvée`);
        }
        return {
          produit: vente.produit,
          quantite: vente.quantite,
          montant: vente.montant,
        };
      })
    );

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=facture.pdf');
    doc.pipe(res);

    // Logo de l'entreprise
    const logoPath = path.join(__dirname, 'logo.png'); // Assurez-vous que le logo est dans le même dossier
    doc.image(logoPath, 50, 45, { width: 50 })
       .fontSize(20)
       .text('FFGGAASS Agraca Solution', 110, 50)
       .fontSize(10)
       .text('Adresse: Commune de la Gombe', 110, 70)
       .text(`Date: ${new Date().toLocaleString()}`, 110, 85)
       .moveDown();

    // Lignes de séparation
    doc.moveTo(50, 110).lineTo(550, 110).stroke();
    doc.moveDown();

    // Informations sur le client
    doc.fontSize(14).text('Facturé à :', 50, 130);
    doc.fontSize(12)
       .text(`Nom : ${client.nom}`, 50, 150)
       .text(`Adresse : ${client.adresse}`, 50, 165)
       .text(`Numéro : ${client.numero}`, 50, 180)
       .moveDown(2);

    // Détails de la facture
    doc.fontSize(14).text('Détails des produits vendus', { underline: true });
    doc.moveDown(0.5);

    // En-têtes des colonnes
    doc.fontSize(12)
       .text('Produit', 50, doc.y)
       .text('Prix Unitaire (FC)', 250, doc.y, { width: 100, align: 'right' })
       .text('Quantité', 350, doc.y, { width: 100, align: 'right' })
       .text('Montant (FC)', 450, doc.y, { width: 100, align: 'right' });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Variables pour calculer le total général
    let totalGeneral = 0;

    // Détails des ventes
    ventesDetails.forEach((vente) => {
      const produit = vente.produit;
      const quantite = vente.quantite;
      const montant = vente.montant;

      doc.fontSize(12).text(produit.nom, 50);
      doc.text(`fc ${produit.prixVente}`, 250, doc.y, { width: 100, align: 'right' });
      doc.text(quantite, 350, doc.y, { width: 100, align: 'right' });
      doc.text(`fc ${montant}`, 450, doc.y, { width: 100, align: 'right' });

      totalGeneral += montant;
      doc.moveDown(0.5);
    });

    // Séparation des sections
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // Montant Total
    doc.fontSize(14).text(`Montant Total : fc ${totalGeneral}`, { align: 'right', bold: true });
    doc.moveDown(2);

    // Remerciement
    doc.fontSize(12).text('Merci pour votre achat !', { align: 'center' });

    // Terminer et envoyer le document
    doc.end();

  } catch (error) {
    console.error('Erreur lors de la génération de la facture PDF :', error);
    res.status(500).json({ message: "Erreur lors de la génération de la facture PDF." });
  }
});




export default pdfGeneratorRouter;
