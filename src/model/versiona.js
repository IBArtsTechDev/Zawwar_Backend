import { DataTypes } from "sequelize";
const defineVersions = (sequelize) => {
    const Version = sequelize.define('Version', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,  
            allowNull: false,     
        },
        app_version: {
            type: DataTypes.STRING,
            allowNull: false,    
        },
       type:{
            type:DataTypes.ENUM("android","ios"),
            allowNull:false,
            default: "android"
        }
    });

    return Version;
};

export default defineVersions;;
