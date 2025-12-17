import mongoose, { Connection } from 'mongoose';

/**
 * Global variable to cache the MongoDB connection.
 * In Next.js, during development, modules can be reloaded which would
 * create multiple connections without this caching mechanism.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: {
    conn: Connection | null;
    promise: Promise<Connection> | null;
  } | undefined;
}

/**
 * Cached connection object to prevent multiple connections in development.
 * Uses a global variable that persists across hot reloads.
 */
const cached: { conn: Connection | null; promise: Promise<Connection> | null } =
  global.mongooseCache ?? { conn: null, promise: null };

// Store the cached connection in global scope for Next.js hot reload support
if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Establishes a connection to MongoDB using Mongoose.
 * Implements connection caching to prevent multiple connections during development.
 *
 * @returns {Promise<Connection>} A promise that resolves to the MongoDB connection
 * @throws {Error} If MONGODB_URI is not defined or connection fails
 */
async function connectDB(): Promise<Connection> {
  // Return existing connection if already established
  if (cached.conn) {
    return cached.conn;
  }

  // Validate MongoDB URI environment variable
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env.local'
    );
  }

  // Reuse existing connection promise if one is in progress
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false, // Disable mongoose buffering
    };

    // Create new connection promise
    cached.promise = mongoose.connect(mongoUri, opts).then((mongooseInstance) => {
      // Return the connection from the mongoose instance
      return mongooseInstance.connection;
    });
  }

  try {
    // Wait for connection to be established
    cached.conn = await cached.promise;
  } catch (error) {
    // Clear promise on error to allow retry
    cached.promise = null;
    throw error;
  }

  // Return the established connection
  return cached.conn;
}

/**
 * Closes the MongoDB connection gracefully.
 * Useful for cleanup in serverless environments or during shutdown.
 *
 * @returns {Promise<void>} A promise that resolves when connection is closed
 */
async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}

export { connectDB, disconnectDB };
export default connectDB;

