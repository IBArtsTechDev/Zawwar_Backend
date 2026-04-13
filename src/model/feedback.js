import { DataTypes } from "sequelize";

const defineFeedback = (sequelize) => {
    const Feedback = sequelize.define('Feedback', {
        feedbackId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            }
        },
        version: {
            type: DataTypes.STRING,
            allowNull: false
        },
        feedback: {
            type: DataTypes.TEXT,
            allowNull: true
        },
    });
    return Feedback;
};

export default defineFeedback;;
