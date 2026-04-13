import { DataTypes } from "sequelize";

const defineGameAnswer = (sequelize)=>{
    const GameAnswer = sequelize.define('GameAnswer',{
        id:{
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId:{
            type: DataTypes.INTEGER,
            allowNull:false, 
        },
        gameId:{
            type: DataTypes.INTEGER,
            allowNull:false,
        },
        isCorrect: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            default:false
        },
        type:{
            type:DataTypes.ENUM('Guess-the-image','Guess-the-word','Scrabble','Word-search','match-the-following')
        }
    });
    return GameAnswer;
};

export default defineGameAnswer;;