import mongoose from "mongoose";

const balanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    availableBalance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    totalSpent: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    allTimeTotalIncome: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Virtual for net balance (availableBalance - totalSpent)
balanceSchema.virtual("netBalance").get(function () {
  return this.availableBalance - this.totalSpent;
});

// Ensure virtuals are included in JSON output
balanceSchema.set("toJSON", { virtuals: true });

const Balance = mongoose.model("Balance", balanceSchema);
export default Balance;
