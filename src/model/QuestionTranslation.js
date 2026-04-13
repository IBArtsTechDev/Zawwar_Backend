import { DataTypes } from "sequelize";

const defineQuestionTranslation = (sequelize) => {
    const QuestionTranslation = sequelize.define('QuestionTranslation', {
        translationId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        questionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Questions',
                key: 'questionId',
            },
        },
        language: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        questions: {
            type: DataTypes.STRING,
            allowNull: false, 
        },
        options: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        correct_Answer: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });
        QuestionTranslation.associate = (models) => {
            QuestionTranslation.belongsTo(models.question, {
                foreignKey: 'questionId',
                as: 'question',
            });
    };

    return QuestionTranslation;
};

export default defineQuestionTranslation;;
