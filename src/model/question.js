import { DataTypes } from "sequelize";
import db from "../config/db.js";
import { google } from "googleapis";

const language = google.language("v1");

const defineQuestion = (sequelize) => {
    const Question = sequelize.define('Question', {
        questionId: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        questionImage:{
          type: DataTypes.STRING,
          allowNull: true
        },
        quizId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        question: {
          type: DataTypes.STRING,     
          allowNull: false,
        },
        options: {
          type: DataTypes.JSON,
          allowNull: false,
        },
        correct_Answer:{
          type:DataTypes.STRING,
          allowNull:false
        },
        time:{
          type:DataTypes.STRING,
          allowNull:false,
          defaultValue:15
        },
        ageLimit:{
          type:DataTypes.ENUM("over","under","all"),
          allowNull:false,
          defaultValue:"all"
        },
        language: {
          type: DataTypes.STRING,
          allowNull: false,
      },
        type:{
          type:DataTypes.ENUM('options','boolean'),
          allowNull:false,
          defaultValue: 'Options'
        }
      });

      Question.associate = (models) => {
        Question.hasMany(models.QuestionTranslation, {
            foreignKey: 'questionId',
            as: 'translations', 
        });
    };

    return Question;
};

export default defineQuestion;;
