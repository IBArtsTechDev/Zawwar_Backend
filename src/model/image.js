import { DataTypes } from "sequelize";

const defineImage = (sequelize) =>{
    const image = sequelize.define('image',{
        id:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            allowNull:false,
            primaryKey:true,
        },
        image:{
            type:DataTypes.STRING,
            allowNull:false
        },
        gameId:{
            type: DataTypes.INTEGER,
            allowNull:false
        }
    })
    return image;

}

export default defineImage;;