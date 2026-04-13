import { DataTypes } from "sequelize";

const defineGuessTheWordTranslation = (sequelize) => {
    const GuessTheWordTranslation = sequelize.define('GuessTheWordTranslation', {
        translationId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        gameId: {
            type: DataTypes.INTEGER,
            allowNull: false, // Ensures translations are deleted if the original word is deleted
        },
        language: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        translationWord: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    return GuessTheWordTranslation;
};

export default defineGuessTheWordTranslation;;
