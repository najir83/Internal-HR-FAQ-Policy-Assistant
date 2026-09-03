import { configDotenv } from 'dotenv';
configDotenv();
import app from './src/app.js';


const PORT = process.env.PORT;
app.listen(PORT, () => {

    console.log(`Server is listening on port: ${PORT}`);
})