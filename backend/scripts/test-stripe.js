import Stripe from "stripe";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to load .env manually if process.env.STRIPE_SECRET_KEY is not defined
function loadEnv() {
  if (process.env.STRIPE_SECRET_KEY) return;

  const envPath = path.resolve(__dirname, "../../.env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    envContent.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || "";
        // Remove surrounding quotes if any
        if (val.length > 0 && val.charAt(0) === '"' && val.charAt(val.length - 1) === '"') {
          val = val.substring(1, val.length - 1);
        }
        if (val.length > 0 && val.charAt(0) === "'" && val.charAt(val.length - 1) === "'") {
          val = val.substring(1, val.length - 1);
        }
        process.env[key] = val;
      }
    });
  }
}

loadEnv();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error("Error: STRIPE_SECRET_KEY environment variable is not defined.");
  console.error("Please ensure that you have configured your .env file in the root directory.");
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey);

async function test() {
  try {
    console.log("Creating test Stripe Checkout Session...");
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product: "prod_UjxCRQh2RrheTO", // Replace with your product ID if needed
            unit_amount: 100, // ₹1
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `http://localhost:8080/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:8080/pricing?payment=cancelled`,
      customer_email: "test@example.com",
    });
    console.log("Success! Checkout Session URL created:");
    console.log(session.url);
  } catch (error) {
    console.error("Stripe Error:", error.message);
  }
}

test();
