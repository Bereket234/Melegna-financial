import mongoose from 'mongoose';

// Measurement units, with optional conversion to a base unit within a family
// Example: family = 'weight', baseUnit = 'g', name 'kg', symbol 'kg', toBaseFactor = 1000
const unitSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    symbol: { type: String, required: true, trim: true },
    family: { type: String, required: true, enum: ['count', 'weight', 'volume', 'length', 'area', 'package', 'other'] },
    baseUnit: { type: String, required: true, trim: true },
    toBaseFactor: { type: Number, required: true, min: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // user-scoped units
  },
  { timestamps: true }
);

unitSchema.index({ user: 1, family: 1, symbol: 1 }, { unique: true });

const Unit = mongoose.model('Unit', unitSchema);
export default Unit;


