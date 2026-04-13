import { DataTypes } from "sequelize";

const defineResults = (sequelize)=>{
    const Result = sequelize.define('Result',{
        id:{
            type:DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        gameId:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        correct:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        wrong:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        totalQuestions:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        points:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        type:{
            type:DataTypes.ENUM('Guess-the-image','Guess-the-word','word-search'),
            allowNull:false
        }
    });
    
    return Result;
};

export default defineResults;;