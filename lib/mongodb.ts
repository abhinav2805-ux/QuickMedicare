import { MongoClient, Db } from 'mongodb'

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    throw new Error('Please define the MONGODB_URI environment variable')
  }

  try {
    const client = new MongoClient(mongoUri)
    await client.connect()
    const db = client.db('quickmedicare')

    cachedClient = client
    cachedDb = db

    console.log('[v0] Connected to MongoDB')
    return { client, db }
  } catch (error) {
    console.error('[v0] MongoDB connection failed:', error)
    throw error
  }
}

export async function closeDatabase(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close()
    cachedClient = null
    cachedDb = null
  }
}
