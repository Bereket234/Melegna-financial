import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
    quantity: { type: Number, required: true, min: 0 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    purchasedAt: { type: Date, required: true },
    merchant: { type: String, trim: true },
    notes: { type: String, trim: true }
  },
  { timestamps: true }
);

purchaseSchema.index({ user: 1, purchasedAt: -1 });
purchaseSchema.index({ user: 1, category: 1, purchasedAt: -1 });
purchaseSchema.index({ user: 1, item: 1, purchasedAt: -1 });

const Purchase = mongoose.model('Purchase', purchaseSchema);
export default Purchase;


