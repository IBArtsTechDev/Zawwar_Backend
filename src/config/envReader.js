import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Required in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.resolve(__dirname, '../../.env')
});


const getEnv =  {
    PORT : process.env.PORT,
    NODE_ENV : process.env.NODE_ENV,

    DB_NAME : process.env.DB_NAME,
    DB_HOST : process.env.DB_HOST,
    DB_PORT : process.env.DB_PORT,
    DB_DIALECT : process.env.DB_DIALECT,
    DB_USERNAME : process.env.DB_USERNAME,
    DB_PASSWORD : process.env.DB_PASSWORD,
    DB_TRUST_CERT : process.env.DB_TRUST_CERT,

    JWT_SECRET : process.env.JWT_SECRET,
    
    MAIL_USER: process.env.MAIL_USER,
    MAIL_PASS: process.env.MAIL_PASS,

    DEV_URL: process.env.DEV_URL,
    PROD_URL: process.env.PROD_URL,
    BASE_URL: process.env.BASEURL
};

export default getEnv;