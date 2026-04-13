import { DataTypes } from "sequelize";
const defineReview = (sequelize)=>{
const Review = sequelize.define('review',{
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    isReviewed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, 
    },
})
return Review;
}

export default defineReview;;