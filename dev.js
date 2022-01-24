const dotenv = require('dotenv');
const path = require('path');

const ENV_FILE = path.join(path.dirname(__dirname), '.env');
dotenv.config({path: ENV_FILE});

const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=> console.log(`Running on http://localhost:${PORT}`));