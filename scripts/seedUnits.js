import dotenv from "dotenv";
import { connectToDatabase } from "../src/config/db.js";
import User from "../src/models/User.js";
import { seedDefaultUnitsForUser } from "../src/utils/seedUnits.js";

dotenv.config();

async function seedUnits() {
  try {
    await connectToDatabase();

    const userEmail = process.argv[2] || process.env.SEED_USER_EMAIL;

    if (!userEmail) {
      console.error(
        "Please provide a user email as argument or set SEED_USER_EMAIL in .env"
      );
      console.log("Usage: node scripts/seedUnits.js user@example.com");
      process.exit(1);
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.error(`User with email ${userEmail} not found`);
      console.log("Please register the user first or use an existing email");
      process.exit(1);
    }

    console.log(`Seeding default units for user: ${user.name} (${user.email})`);

    const units = await seedDefaultUnitsForUser(user._id);

    console.log(`\nSuccessfully seeded ${units.length} default units!`);
    console.log("\nUnits created:");
    units.forEach((unit) => {
      console.log(`  - ${unit.name} (${unit.symbol}) [${unit.family}]`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding units:", error);
    process.exit(1);
  }
}

seedUnits();
