import { DataTypes } from "sequelize";

const defineSearch = (sequelize) => {
    const Search = sequelize.define('Search', {
        gameId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        level: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        title:{
            type:DataTypes.STRING,
            allowNull:false,
        },
        validWords: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        total_plays:{
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull:false
        },
        language: {
            type: DataTypes.STRING,
            allowNull: false,
          },
    });

    return Search;
};

export default defineSearch;;
