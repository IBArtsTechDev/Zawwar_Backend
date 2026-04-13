import { DataTypes } from "sequelize";

const defineGuesstheWord = (sequelize) => {
    const GuessTheWord = sequelize.define('GuessTheWords', {
        gameId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        level: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        word:{
            type:DataTypes.STRING,
            allowNull:false
        },
        correct_Image: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        isGujrati:{
            type: DataTypes.BOOLEAN,
            allowNull:false,
            defaultValue: false,
        },
        total_plays: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },

    });
    return GuessTheWord;
};

export default defineGuesstheWord;;