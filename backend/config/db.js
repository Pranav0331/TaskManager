import dns from 'node:dns';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Fix MongoDB Atlas querySrv EETIMEOUT by configuring reliable DNS servers
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignore in environments where setting DNS servers is not allowed
}

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
