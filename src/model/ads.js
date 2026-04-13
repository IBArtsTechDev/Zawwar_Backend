import { DataTypes } from "sequelize";

const defineAds = (sequelize) =>{
    const Ads = sequelize.define('Ads',{
        adsId:{
            type:DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        adsName:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        description:{
            type: DataTypes.STRING,
            allowNull:true,
        },
        adsImage:{
            type: DataTypes.STRING,
            allowNull:true
        },
        adsVideo:{
            type: DataTypes.STRING,
            allowNull:true
        },
        targetUrl:{
            type:DataTypes.STRING,
            allowNull: true,
        },
        type:{
            type:DataTypes.ENUM("Banner","Video")
        },
        clicks:{
            type:DataTypes.INTEGER,
            allowNull:false,
            defaultValue:0
        },
        language:{
            type:DataTypes.ENUM("guj","en"),
            allowNull:true,
            default:"en"
        },
        isActive:{
            type:DataTypes.BOOLEAN,
            allowNull:false,
            defaultValue: true,
        }
    })
    return Ads;
}
export default defineAds;;