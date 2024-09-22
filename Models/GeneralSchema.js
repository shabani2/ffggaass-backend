import mongoose from 'mongoose';
const { Schema } = mongoose;
const GeneraleSchema = new Schema({
  denominationsociale: {
    type: String,
    required: true
  },
  numerorccm: {
    type: String,
    required: true
  },
  dateimmatriculation: {
    type: Date,
    required: true
  },
  datedebutexploitation: {
    type: Date,
    required: true
  },
  origine: {
    type: String,
    required: true
  },
  formejuridique: {
    type: String,
    required: true
  },
  capitalesociale: {
    type: Number,
    required: true
  },
  duree: {
    type: Number,
    required: true
  },
  sigle: {
    type: String
  },
  adressedusiege: {
    type: String,
    required: true
  },
  secteuractiviteohada: {
    type: String,
    required: true
  },
  activiteprincipaleohada: {
    type: String,
    required: true
  },
  logoentreprise: {
    type: String // Cela pourrait être un chemin vers le fichier du logo, ou une URL
  }
});
export default mongoose.model('General', GeneraleSchema);
