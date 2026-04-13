import { DataTypes, Sequelize } from "sequelize";
import db from "../config/db.js";

const defineActivity = (sequelize)=>{
    const activity = sequelize.define("Activity",{
        id:{
            type:DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey:true
        }, 
        gameId:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        game_category:{
            type:DataTypes.ENUM('Quiz','Scrabble','Word_Search','Guess_Image','Guess_Word','Match'),
            allowNull:false,
        },
        userId:{
            type:DataTypes.INTEGER,
            allowNull:false,
        }
    })
    return activity ;
}

export default defineActivity;;