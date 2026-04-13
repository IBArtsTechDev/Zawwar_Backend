import { DataTypes } from "sequelize";

const defineQuizTranslation = (sequelize) => {
  const QuizTranslation = sequelize.define('QuizTranslation', {
    translationId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    quizId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Quizzes',
        key: 'quizId',
      },
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quizName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  QuizTranslation.associate = (models) => {
    QuizTranslation.belongsTo(models.quiz, {
      foreignKey: 'quizId',
      as: 'Quizzes',
    });
  };

  return QuizTranslation;
};

export default defineQuizTranslation;;
