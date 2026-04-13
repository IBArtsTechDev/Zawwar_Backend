import { DataTypes } from "sequelize";

const definePoint = (sequelize) =>{
    const Points = sequelize.define("points",{
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        points: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    });
    return Points;
};

export default definePoint;;