import { DataTypes } from "sequelize";

const defineQuizAnswer = (sequelize)=>{
    const QuizAnswer = sequelize.define('QuizAnswer',{
        id:{
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId:{
            type: DataTypes.INTEGER,
            allowNull:false, 
        },
        questionId:{
            type: DataTypes.INTEGER,
            allowNull:false,
        },
        isCorrect: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    });
    return QuizAnswer;
};

export default defineQuizAnswer;;