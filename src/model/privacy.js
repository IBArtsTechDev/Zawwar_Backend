import { DataTypes } from "sequelize";

const definePrivacy = (sequelize) =>{
    const Privacy = sequelize.define('Privacy',{
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
    return Privacy;
};

export default definePrivacy;;