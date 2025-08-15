const { MongoClient, ServerApiVersion } = require('mongodb');

let client;
let db;

async function connectDB(uri, DB_NAME) {
    if (db) return db;
    client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true
        },
        maxPoolSize: 10
    });
    await client.connect();
    db = client.db(DB_NAME);

    // índices para las colecciones
    await Promise.all([
        db.collection('courts').createIndex({ name: 1 }, { unique: true }),
        db.collection('reservations').createIndex({ courtId: 1, date: 1, startMins: 1, endMins: 1 }),
    ]);

    console.log('✅ MongoDB Driver conectado');
    return db;
}

function getDB() {
    if (!db) throw new Error('DB not initialized. Call connectDB first.');
    return db;
}

function getCollection(name) {
    return getDB().collection(name);
}

async function disconnectDB() {
    if (client) await client.close();
    db = null;
}

module.exports = { connectDB, getDB, getCollection, disconnectDB };
