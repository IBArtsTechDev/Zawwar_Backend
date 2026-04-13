import { DataTypes } from "sequelize";
const defineVersions = (sequelize) => {
    const Version = sequelize.define('weeklyWInners', {
        winnerId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        totalPoints: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        weekStartDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        weekEndDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        }
    });

    return Version;
};

export default defineVersions;;
