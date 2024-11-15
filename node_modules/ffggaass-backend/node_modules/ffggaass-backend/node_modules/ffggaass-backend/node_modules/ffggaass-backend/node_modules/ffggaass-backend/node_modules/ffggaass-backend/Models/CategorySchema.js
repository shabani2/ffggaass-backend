
import mongoose from 'mongoose';

// Définition du schéma pour Category
const categorySchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },
  unite: {
    type: String,
    required: true,
  },
  piecenombre: {
    type: Number,
    required: true,
  },
},{ timestamps: true });

// Création du modèle pour Category
const Category= mongoose.model('Category', categorySchema);
export default Category