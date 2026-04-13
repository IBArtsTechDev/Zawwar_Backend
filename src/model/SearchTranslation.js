import { DataTypes } from "sequelize";

const defineSearchTranslation = (sequelize) => {
    const SearchTranslation = sequelize.define('SearchTranslation', {
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
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        validWords: {
            type: DataTypes.JSON,
            allowNull: false,
        }
    });

    return SearchTranslation;
};

export default defineSearchTranslation;;
