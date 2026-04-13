import { DataTypes } from "sequelize";

const defineQuiz = (sequelize) => {
  const Quiz = sequelize.define('Quiz', {
    quizId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },  
    quizName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quizImage: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue:"./img.png"
    },
    category:{
      type:DataTypes.STRING,
      allowNull: false,
      defaultValue:"quiz"
    },
    noOfQuestions: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('noOfQuestions');
      }
    },
    totalPlays:{
      type:DataTypes.INTEGER,
      allowNull:false,
      defaultValue:0
    },
    isGujrati: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
  },
    language: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Quiz.associate = (models) => {
    Quiz.hasMany(models.quizTrans, {
      foreignKey: 'quizId',
      as: 'translations',
    });
  };  

  return Quiz;
};

export default defineQuiz;;
