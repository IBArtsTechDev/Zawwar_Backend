import { DataTypes } from "sequelize";

const defineGuesstheImageTranslation = (sequelize) => {
    const GuesstheImageTranslation = sequelize.define('GuesstheImageTranslation', {
        translationId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        gameId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        language: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        word: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        translationImage:{
            type: DataTypes.STRING,
            allowNull: true,    
        }
    });

    return GuesstheImageTranslation;
};

export default defineGuesstheImageTranslation;;
