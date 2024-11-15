import mongoose from 'mongoose';

const { Schema } = mongoose;

const stockLocalSchema = new Schema(
    {
        produit: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Produit',
          required: true,
        },
        quantiteTotale: {
          type: Number,
          required: true,
          default: 0, // Initialement à 0
        },
      },
      { timestamps: true }
   
);

const StockLocal = mongoose.model('StockLocal', stockLocalSchema);

export default StockLocal;
