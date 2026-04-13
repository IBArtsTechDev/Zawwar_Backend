import { DataTypes } from "sequelize";

const defineTerms = (sequelize) =>{
    const Terms = sequelize.define('Terms',{
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT('long'),
            allowNull: false
        },
        language: {
            type: DataTypes.ENUM("English","Gujarati"),
            allowNull: false,
        },
    });
    return Terms;
};

export default defineTerms;;