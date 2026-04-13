import { DataTypes } from "sequelize";
import db from "../config/db.js";

const defineNotification = (sequelize) => {
  const Notification = sequelize.define("Notification", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue:0
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false  
    },
    title:{
      type: DataTypes.STRING,
      allowNull: false 
    },
    type: {
      type: DataTypes.ENUM('all', 'individual'),
      defaultValue: 'all', 
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
  },);

  return Notification;
}

export default defineNotification;;
