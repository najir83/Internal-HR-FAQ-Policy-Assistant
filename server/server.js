import { configDotenv } from 'dotenv';
configDotenv();

import app from './src/app.js';
import { initQdrant } from './src/services/qdrant.service.js';



initQdrant();
const PORT = process.env.PORT;
app.listen(PORT, () => {

    console.log(`Server is listening on port: ${PORT}`);
})