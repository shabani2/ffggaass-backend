import mongoose from 'mongoose';

const { Schema } = mongoose;

const stockVariationSchema = new Schema(
  {
    produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produit',
      required: true,
    },
    pointVente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PointVente',
      required: true,
    },
    quantiteLivre: {
      type: Number,
      required: true,
      default: 0,
    },
    quantiteVendu: {
      type: Number,
      required: true,
      default: 0,
    },
    solde: {
      type: Number,
      required: true,
      default: function() {
        return this.quantiteLivre - this.quantiteVendu;
      }
    },
  },
  { timestamps: true }
);

stockVariationSchema.pre('save', function (next) {
  this.solde = this.quantiteLivre - this.quantiteVendu;
  next();
});

const StockVariation = mongoose.model('StockVariation', stockVariationSchema);

export default StockVariation;
