import { DataTypes, Sequelize } from "sequelize";


const defineProgress =(sequelize) =>{
    const Progress = sequelize.define("Progress",{
        id:{
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey:true,
        },
        quizId: {
            type: DataTypes.INTEGER,
            allowNull: true
          },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
          },
        currentQuestion:{
            type:DataTypes.INTEGER,
            allowNull:false,
            defaultValue: 1
        },
        fiftyFifty:{
            type:DataTypes.BOOLEAN,
            allowNull:false,
            defaultValue:false
        },
        phone:{
            type:DataTypes.BOOLEAN,
            allowNull:false,
            defaultValue:false
        },
        skip:{
          type:DataTypes.BOOLEAN,
          allowNull:false,
          defaultValue:false
        },
        pauseTime:{
          type:DataTypes.BOOLEAN,
          allowNull:false,
          defaultValue:false
        },
        noOfQuestions: {
            type: DataTypes.VIRTUAL,
            get() {
              return this.getDataValue('noOfQuestions');
            }
        },
        type:{
          type:DataTypes.STRING,
          allowNull:false
        }
    });
    return Progress;
};

export default defineProgress;;