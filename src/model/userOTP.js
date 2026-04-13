import { DataTypes } from "sequelize";

export default (sequelize) => {
    const UserOtp = sequelize.define('user_otp', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        otp: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        expiryTime: {
            type: DataTypes.DATE,
            allowNull: false
        },
        verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    });

    return UserOtp;
};;
