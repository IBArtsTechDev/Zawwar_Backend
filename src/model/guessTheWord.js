import { DataTypes } from "sequelize";

const defineGuesstheWord = (sequelize) => {
    const GuessTheWord = sequelize.define('GuessTheWord', {
        gameId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        level: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        correctWord: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        time: {
            type: DataTypes.INTEGER, 
            allowNull: false,
        },
        image1: {
            type: DataTypes.STRING, 
            allowNull: true,
        },
        image2: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        image3: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        image4: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        isGujrati:{
            type: DataTypes.BOOLEAN,
            allowNull:false,
            defaultValue: false,
        }
    });

    return GuessTheWord;
};

export default defineGuesstheWord;;