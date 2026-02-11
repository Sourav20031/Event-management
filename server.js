const app = require('./app');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`
    ╔═══════════════════════════════════════╗
    ║   Event Management System Server      ║
    ║   Running on http://${HOST}:${PORT}      ║
    ╚═══════════════════════════════════════╝
    
    Access the application at: http://localhost:3000
  `);
});
