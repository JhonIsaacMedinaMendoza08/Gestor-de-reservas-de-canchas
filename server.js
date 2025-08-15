require('dotenv').config();
const app = require('./src/app');
const { connectDB } = require('./src/config/db.js');

const PORT = process.env.PORT || 4000;

(async () => {
    try {
        await connectDB(process.env.MONGODB_URI, process.env.DB_NAME);
        app.listen(PORT, () => console.log(`🚀 API lista en http://localhost:${PORT}`));
    } catch (err) {
        console.error('No se pudo iniciar el servidor:', err);
        process.exit(1);
    }
})();
