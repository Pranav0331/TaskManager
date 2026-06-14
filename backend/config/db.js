import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer;

const shouldUseInMemoryDB = () => {
  if (process.env.USE_IN_MEMORY_DB === 'true') return true;

  const uri = process.env.MONGODB_URI || '';
  return (
    !uri ||
    uri.includes('<username>') ||
    uri.includes('<password>') ||
    uri.includes('xxxxx')
  );
};

/**
 * Connect to MongoDB (Atlas in production, in-memory for local dev)
 */
const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    if (shouldUseInMemoryDB()) {
      memoryServer = await MongoMemoryServer.create();
      uri = memoryServer.getUri('taskflow');
      console.log('Using in-memory MongoDB for local development');
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
