import { DataTypes } from "sequelize";

const defineGuesstheimage = (sequelize) => {
    const GuesstheImage = sequelize.define('GuesstheImage', {
        gameid: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        level: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        gameImage: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
        },
        word: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        noOfPlays: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        total_plays: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        isGujrati:{
            type:DataTypes.BOOLEAN,
            allowNull:false,
            defaultValue:false
        }
    });

    return GuesstheImage;
};

export default defineGuesstheimage;;
