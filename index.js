import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import error from './src/middleware/response/error.js'
import success from './src/middleware/response/success.js';
import quizRouter from './src/routes/quiz.js'
import mathc from './src/routes/match.js'
import terms from './src/routes/terms.js';
import userRouter from './src/routes/user.js';
import adminRouter from './src/routes/admin.js';
import imageRouter from './src/routes/guessTheImage.js';
import wordRouter from './src/routes/guessTheWord.js';
import leagues from './src/routes/play.js';
import ads from './src/routes/Ads.js';
import wordSearch from './src/routes/wordSearch.js';
import privacy from './src/routes/privacy.js';
import db, { initialize } from './src/config/db.js'
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./src/config/swagger.js";
import requestLogger from "./src/middleware/requestLogger.js";





const app = express()

dotenv.config()

const corsOptions = {
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type','Authorization'],
};

const port = process.env.PORT

app.use(express.static('uploads'));
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use(express.json());
app.use(requestLogger);
app.use('/play',quizRouter,wordSearch,mathc);
app.use('/leagues',leagues)
app.use('/play/word',imageRouter)
app.use('/play/guess',wordRouter)
app.use("/user",userRouter);
app.use('/admin',adminRouter,ads,terms,privacy);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(success)
app.use(error)

async function startServer() {
    try {
        await initialize(); 

        if (db.sequelize) {
            console.log("Database is connected.");
        }

        app.listen(port, () => {
            console.log(`server running at ${port}`);
        });

    } catch (error) {
        console.error("Startup error:", error);
        process.exit(1);
    }
}

startServer();
