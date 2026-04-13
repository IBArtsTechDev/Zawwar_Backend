import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";

const defineUser = (sequelize) => {
  const User = sequelize.define('User', {
    userId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    profile_avatar: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
      set(value) {
        const hashedPassword = bcrypt.hashSync(value, bcrypt.genSaltSync(10));
        this.setDataValue('password', hashedPassword);
      },
    },
    phoneNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    current_rank: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tag: {
      type: DataTypes.ENUM('Beginner', 'Intermediate', 'Expert'),
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
     userType: {
      type: DataTypes.ENUM('user', 'admin','editor'),
      allowNull: false,
      defaultValue: 'user',
    },
    fcm:{
      type:DataTypes.STRING,
      allowNull:true,
    },
    badges: {
      type: DataTypes.JSON,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('badges');
        if (!rawValue) return [];
        try {
          return JSON.parse(rawValue);
        } catch (error) {
          return [];
        }
      },
      set(value) {
        this.setDataValue('badges', JSON.stringify(value));
      },
    },
    socialLoginId:{
      type:DataTypes.TEXT,
      allowNull:true
    },

    dob:{
      type:DataTypes.DATEONLY,
      allowNull:true
    },
    socialLoginType:{
      type:DataTypes.STRING,
      allowNull:true 
    }
  }, {
    hooks: {
      beforeSave: async (user) => {
        if (user.points < 200) {
          user.tag = 'Beginner';
        } else if (user.points < 800) {
          user.tag = 'Intermediate';
        } else {
          user.tag = 'Expert';
        }
      },
    },
  });

  return User;
};

export default defineUser;;
