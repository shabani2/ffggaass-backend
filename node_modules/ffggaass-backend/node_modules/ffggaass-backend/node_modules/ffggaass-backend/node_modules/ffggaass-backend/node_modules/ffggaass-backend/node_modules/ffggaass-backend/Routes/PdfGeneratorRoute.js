import express from 'express';
import PDFDocument from 'pdfkit'; // Bibliothèque pour la génération de PDF
//import Vente from '../Models/VentesSchema.js'; // Modèle Vente
import Produit from '../Models/ProduitSchema.js' // Modèle Produit
import Vente from '../Models/VenteSchema.js'; // Assurez-vous que le chemin est correct


const pdfGeneratorRouter = express.Router();

pdfGeneratorRouter.post('/facture', async (req, res) => {
  try {
    const { client, ventes } = req.body; // On reçoit une liste de ventes et les détails du client

    // Vérification de la validité des paramètres
    if (!client || !ventes || ventes.length === 0) {
      return res.status(400).json({ message: "Client et ventes sont requis." });
    }

    // Récupérer les détails de chaque vente
    const ventesDetails = await Promise.all(
      ventes.map(async (venteId) => {
        // Récupérer chaque vente par son ID et peupler les détails du produit
        const vente = await Vente.findById(venteId).populate('produit').exec();
        if (!vente) {
          throw new Error(`Vente avec l'ID ${venteId} non trouvée`);
        }
        return {
          produit: vente.produit,  // L'objet produit récupéré via `populate`
          quantite: vente.quantite,
          montant: vente.montant,
        };
      })
    );

    // Créer un nouveau document PDF
    const doc = new PDFDocument({ margin: 50 });

    // Configurer les en-têtes HTTP pour indiquer qu'il s'agit d'un PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=facture.pdf');

    // Créez un flux de réponse PDF
    doc.pipe(res);

    // Ajouter l'en-tête de la facture
    doc.fontSize(18).text('Facture', { align: 'center' });
    doc.moveDown();

    // Informations sur l'entreprise
    doc.fontSize(12).text('FFGGAASS Agraca Solution', { align: 'left' });
    doc.text('Adresse: Commune de la Gombe', { align: 'left' });
    doc.text(`Date: ${new Date().toLocaleString()}`, { align: 'left' });
    doc.moveDown(2);

    // Informations sur le client
    doc.fontSize(14).text('Détails du client :');
    doc.fontSize(12).text(`Nom : ${client.nom}`);
    doc.text(`Adresse : ${client.adresse}`);
    doc.text(`Numéro : ${client.numero}`);
    doc.moveDown(1.5);

    // Titre pour les produits vendus
    doc.fontSize(14).text('Détails des produits vendus :', { underline: true });
    doc.moveDown(0.5);

    // Variables pour calculer le total général
    let totalGeneral = 0;

    // Détails des ventes
    ventesDetails.forEach((vente) => {
      const produit = vente.produit;
      const quantite = vente.quantite;
      const montant = vente.montant;

      // Afficher les détails de chaque produit vendu
      doc.fontSize(12).text(`${produit.nom} - fc: ${produit.prixVente} x ${quantite} = fc: ${montant}`);

      // Ajouter le montant au total général
      totalGeneral += montant;
    });

    doc.moveDown(1.5);

    // Afficher le montant total
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
