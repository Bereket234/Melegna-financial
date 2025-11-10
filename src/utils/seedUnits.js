import Unit from "../models/Unit.js";

/**
 * Default units commonly used in Ethiopia
 * Organized by family with base units and conversion factors
 */
const DEFAULT_UNITS = [
  // Weight units (base: gram)
  {
    name: "Gram",
    symbol: "g",
    family: "weight",
    baseUnit: "g",
    toBaseFactor: 1,
  },
  {
    name: "Kilogram",
    symbol: "kg",
    family: "weight",
    baseUnit: "g",
    toBaseFactor: 1000,
  },
  {
    name: "Milligram",
    symbol: "mg",
    family: "weight",
    baseUnit: "g",
    toBaseFactor: 0.001,
  },


  // Volume units (base: liter)
  {
    name: "Liter",
    symbol: "L",
    family: "volume",
    baseUnit: "L",
    toBaseFactor: 1,
  },
  {
    name: "Milliliter",
    symbol: "mL",
    family: "volume",
    baseUnit: "L",
    toBaseFactor: 0.001,
  },
 
  {
    name: "Piece",
    symbol: "pcs",
    family: "count",
    baseUnit: "pcs",
    toBaseFactor: 1,
  },
  {
    name: "Dozen",
    symbol: "dz",
    family: "count",
    baseUnit: "pcs",
    toBaseFactor: 12,
  },
  {
    name: "Pack",
    symbol: "pack",
    family: "count",
    baseUnit: "pcs",
    toBaseFactor: 1,
  },
  
  {
    name: "Meter",
    symbol: "m",
    family: "length",
    baseUnit: "m",
    toBaseFactor: 1,
  },
  {
    name: "Centimeter",
    symbol: "cm",
    family: "length",
    baseUnit: "m",
    toBaseFactor: 0.01,
  },
  {
    name: "Millimeter",
    symbol: "mm",
    family: "length",
    baseUnit: "m",
    toBaseFactor: 0.001,
  },
  {
    name: "Carton",
    symbol: "carton",
    family: "package",
    baseUnit: "carton",
    toBaseFactor: 1,
  },
];

export async function seedDefaultUnitsForUser(userId) {
  try {
    const unitsToCreate = DEFAULT_UNITS.map((unit) => ({
      ...unit,
      user: userId,
    }));

    const existingUnits = await Unit.find({ user: userId });
    const existingSymbols = new Set(
      existingUnits.map((u) => `${u.family}-${u.symbol}`)
    );

    const newUnits = unitsToCreate.filter(
      (unit) => !existingSymbols.has(`${unit.family}-${unit.symbol}`)
    );

    if (newUnits.length === 0) {
      console.log("All default units already exist for this user");
      return existingUnits;
    }

    const createdUnits = await Unit.insertMany(newUnits);
    console.log(
      `Created ${createdUnits.length} default units for user ${userId}`
    );
    return createdUnits;
  } catch (error) {
    console.error("Error seeding default units:", error);
    throw error;
  }
}

export function getDefaultUnits() {
  return DEFAULT_UNITS;
}
