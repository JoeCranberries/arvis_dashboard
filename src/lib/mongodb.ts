import { MongoClient, Db } from "mongodb";

// Cached connection. Uses a global in dev so HMR doesn't open a new pool each reload.
// Lazy (no top-level throw) so the app still builds without MONGODB_URI set.

const DB_NAME = process.env.MONGODB_DB || "arvi_dashboard";

let clientPromise: Promise<MongoClient> | undefined;

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Create a .env.local file with your MongoDB Atlas connection string."
    );
  }

  if (process.env.NODE_ENV === "development") {
    const g = globalThis as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };
    if (!g._mongoClientPromise) {
      g._mongoClientPromise = new MongoClient(uri).connect();
    }
    return g._mongoClientPromise;
  }

  if (!clientPromise) {
    clientPromise = new MongoClient(uri).connect();
  }
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(DB_NAME);
}
