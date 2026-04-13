import db from "../../config/db.js";
import asyncHandler from "../../middleware/async.js";
import ErrorResponse from "../../utlis/ErrorResponse.js";
import { getCountryCode } from "../../utlis/country_code.js";
import { Op } from "sequelize";

function getDateRange(type) {
    const now = new Date();
    let startDate, endDate;

    switch (type) {
        case 'weekly':
            startDate = new Date();
            startDate.setDate(startDate.getDate() - startDate.getDay()); 
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6); 
            endDate.setHours(23, 59, 59, 999); 
            break;

        case 'monthly':
            // Start of the current month
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            startDate.setHours(0, 0, 0, 0); // Set to start of the day
   
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endDate.setHours(23, 59, 59, 999); // Set to end of the day
            break;

        case 'yearly':
        default:
            startDate = new Date(now.getFullYear(), 0, 1);
            startDate.setHours(0, 0, 0, 0); 
        
            endDate = new Date(now.getFullYear(), 11, 31);
            endDate.setHours(23, 59, 59, 999); // Set to end of the day
            break;
    }

    return { startDate, endDate };
}


const fetchUserProfile = asyncHandler(async (userId,type = 'yearly') => {

    if (!userId) {
        throw new ErrorResponse("User ID is required", 400);
    }

    const profile = await db.user.findOne({
        where: { userId },
        attributes: [
            'userId', 'userName', 'userEmail', 'phoneNo', 'points', 'tag', 'badges', 'profile_avatar', 'dob'
        ]
    });

    if (!profile) {
        throw new ErrorResponse("User does not exist", 404);
    }

    if (!['weekly', 'monthly', 'yearly'].includes(type)) {
        throw new ErrorResponse('Invalid type. Use "weekly", "monthly", or "yearly".', 400);
    }

    const { startDate, endDate } = getDateRange(type);

    const leaderboard = await db.points.findAll({
        attributes: [
            'userId',
            [db.sequelize.fn('SUM', db.sequelize.col('points')), 'totalPoints']
        ],
        where: {
            userId, 
            createdAt: {
                [Op.between]: [startDate, endDate]
            }
        },
        group: ['userId'],
        raw: true
    });

    const totalPoints = leaderboard.length ? leaderboard[0].totalPoints : 0;

    const fullLeaderboard = await db.points.findAll({
        attributes: [
            'userId',
            [db.sequelize.fn('SUM', db.sequelize.col('points')), 'totalPoints']
        ],
        where: {
            createdAt: {
                [Op.between]: [startDate, endDate]
            }
        },
        group: ['userId'],
        order: [[db.sequelize.literal('totalPoints'), 'DESC']],
        raw: true
    });

    const pointsMap = fullLeaderboard.reduce((acc, entry, index) => {
        acc[entry.userId] = {
            totalPoints: entry.totalPoints,
            rank: index + 1
        };
        return acc;
    }, {});

    const userRanking = pointsMap[userId] ? pointsMap[userId].rank : null;

    let cleanedPhoneNumber = null;
    let countryCode = "91";
  
    if (profile.phoneNo) {
        countryCode = getCountryCode(profile.phoneNo);
        cleanedPhoneNumber = profile.phoneNo.replace(new RegExp(`^${countryCode}`), '');
    }

    profile.points = totalPoints;
    await profile.save();

    const { updatedAt, ...userData } = profile.dataValues;

    return {
        ...userData,
        rank: userRanking,
        phoneNo: cleanedPhoneNumber,
        countryCode 
    };
});


// const fetchUserRank=async()=>{

// }

// const updateUserPoints=async()=>{

// }

// const fetchUserBadges = async() =>{

// }

const updateUserProfile = asyncHandler(async (body, file, query) => {
  const { userId } = query;
  const { userName, userEmail, password, phoneNo, dob, countryCode: newCountryCode } = body;
	console.log(body)
  const existing_user = await db.user.findOne({ where: { userId } });
  if (!existing_user) {
    throw new ErrorResponse("User does not exist", 404);
  }

  let cleanedPhoneNumber = phoneNo || null;
  let currentCountryCode = null;

  // Check if the user has an existing phone number
  if (existing_user.phoneNo) {
    // Extract the existing country code and clean the existing phone number
    currentCountryCode = getCountryCode(existing_user.phoneNo);
    cleanedPhoneNumber = existing_user.phoneNo.replace(new RegExp(`^${currentCountryCode}`), '');

    // If a new phoneNo is provided, remove any country code from it
    if (phoneNo) {
      cleanedPhoneNumber = phoneNo.replace(new RegExp(`^${currentCountryCode}`), '');
    }
  }

  // If a new country code is provided, remove any '+' and use it, otherwise use the existing one (if available)
  let countryCode = newCountryCode ? newCountryCode.replace('+', '') : currentCountryCode;

  // If a phone number exists or is provided, update the phone number with the country code
  let updatedPhoneNo = null;
  if (cleanedPhoneNumber) {
    updatedPhoneNo = `${countryCode || ''}${cleanedPhoneNumber}`; // Use the new/existing country code
  }

  const data = {
    userName: userName || existing_user.userName,
    userEmail: userEmail || existing_user.userEmail,
    phoneNo: updatedPhoneNo,  // Save updated phone number with country code
    profile_avatar: file ? file.filename : existing_user.profile_avatar,
    dob : dob || existing_user.dob,
  };
console.log(data)
  if (password) {
    data.password = password;
  }

  const updatedUser = await existing_user.update(data);

  return {
    userId: updatedUser.userId,
    userName: updatedUser.userName,
    userEmail: updatedUser.userEmail,
    profile_avatar: updatedUser.profile_avatar,
    points: updatedUser.points,
    tag: updatedUser.tag,
    userType: updatedUser.userType,
    countryCode: countryCode,
    phoneNo: cleanedPhoneNumber,  // Return cleaned phone number (without country code)
    dob: updatedUser.dob,
  };
});


export default {
fetchUserProfile,
updateUserProfile 
};;