import { DataTypes } from "sequelize";

const defineMatchTranslation = (sequelize) => {
  const MatchTranslation = sequelize.define('MatchTranslation', {
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
    question: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    left: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    right: {
      type: DataTypes.JSON,
      allowNull: true,
    }
  });

  return MatchTranslation;
};

export default defineMatchTranslation;;
