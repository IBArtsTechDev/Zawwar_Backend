import { DataTypes } from "sequelize";

const defineMatch = (sequelize) => {
  const Match = sequelize.define('Match', {
    gameId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    question: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    level: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    left: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    right: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    language: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    total_plays:{
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue:0

    }
  });
  return Match;
};

export default defineMatch;;
