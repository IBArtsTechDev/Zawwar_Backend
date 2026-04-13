import { DataTypes } from "sequelize";

const definBadges = (sequelize)=>{
    const Badges = sequelize.define('Badges',{
        badgeId: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          name: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          description: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          icon: {
            type: DataTypes.STRING,
            allowNull: true, 
          },
          pointsRequires:{
            type:DataTypes.INTEGER,
            allowNull: false,
          }
    })
    return Badges;
}
export default definBadges;;