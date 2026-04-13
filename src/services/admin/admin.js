import db from "../../config/db.js";
import ErrorResponse from "../../utlis/ErrorResponse.js";
import asyncHandler from "../../middleware/async.js";
import { Op } from "sequelize";
import serviceAccount from "../../../serviceAccountKey.json" with { type: "json" };
import { sendPushNotification } from "../../utlis/notification.js";

const createUser = asyncHandler(async (body) => {
    const { userEmail, userType } = body;
    const existingUser = await db.user.findOne({ where: { userEmail } });
    if (existingUser) {
        throw new ErrorResponse('Email already exists', 404);
    }
    if (userType === 'admin') {
        const existingAdmin = await db.user.findOne({ where: { userType: 'admin' } });
        if (existingAdmin) {
            throw new ErrorResponse('An admin already exists', 400);
        }
    }
    const newUser = await db.user.create(body);
    return newUser;
});
const version = asyncHandler(async (body) => {
    const { version: appVersion, type } = body;
    if (!appVersion) {
        throw new ErrorResponse("Version is required", 400);
    }
    if (!type || !['android', 'ios'].includes(type)) {
        throw new ErrorResponse("Type must be 'android' or 'ios'", 400);
    }
    let versionRecord = await db.version.findOne({ where: { type } });

    if (versionRecord) {
        await versionRecord.update({ app_version: appVersion });
    } else {
        versionRecord = await db.version.create({ app_version: appVersion, type });
    }
    return versionRecord;
});

const getVersion = asyncHandler(async (query)=>{
    const { type } = query;
    const version = await db.version.findOne({where:{type}});
    if(!version){
        return []
    }
    return version
})


const sendNotificationAll = asyncHandler(async (body) => {
    const { message, title } = body;
    console.log(body);
    if (!message) {
        throw new ErrorResponse("Message is required", 400);
    }
    if (!title) {
        throw new ErrorResponse("Title is required", 400);
    }
    const transaction = await db.sequelize.transaction();
    try {
        const users = await db.user.findAll({ transaction });
        const registrationTokens = users
            .filter(user => user.fcm && typeof user.fcm === 'string' && user.fcm.trim() !== '')
            .map(user => user.fcm);
        if (registrationTokens.length === 0) {
            console.log('No valid registration tokens found');
            await transaction.commit();
            return [];
        }
        console.log('Registration tokens:', registrationTokens);
        const response = await sendPushNotification(registrationTokens, title, message); // Send to all tokens
        console.log(response)
        if (response.success) {
            await db.notification.create({
                message: message,
                title,
                type: 'all'
            }, { transaction });
            await transaction.commit();
        } else {
            await transaction.rollback();
            throw new ErrorResponse("Some notifications failed to send", 500);
        }
        return [];

    } catch (error) {
        console.error('Error sending notification:', error.message || error);
        await transaction.rollback();
        throw new ErrorResponse('Error sending notification', 500);
    }
});
const updateUser = asyncHandler(async (query, body) => {
    const { userId } = query;
    const { userType } = body;

    if (!userId) {
        throw new ErrorResponse('User ID is required', 400);
    }
    const user = await db.user.findOne({ where: { userId } });
    if (!user) {
        throw new ErrorResponse('User does not exist', 404);
    }
    if (userType === 'admin' && user.userType !== 'admin') {
        const existingAdmin = await db.user.findOne({ where: { userType: 'admin' } });
        if (existingAdmin) {
            throw new ErrorResponse('An admin already exists', 400);
        }
    }
    await user.update(body);

    return {
        success: true,
        data: user,
    };
});


const deleteUser = asyncHandler(async (query) => {
    const { userId } = query;
    const transaction = await db.sequelize.transaction();

    try {
        const user = await db.user.findOne({ where: { userId }, transaction });
        if (!user) {
            throw new ErrorResponse('User does not exist', 400);
        }
        await db.points.destroy({ where: { userId }, transaction });
        const otpDeleted = await db.userOtp.destroy({ where: { email: user.userEmail }, transaction });
        if (otpDeleted === 0) {
            console.log('No OTP records found for the user.');
        }
        await user.destroy({ transaction });
        await transaction.commit();

        return {
            message: 'User, points, scores, and associated OTP record deleted successfully'
        };
    } catch (error) {
        await transaction.rollback();
        console.error('Error in deleteUser:', error);
        throw error;
    }
});
const fetchUsers = asyncHandler(async () => {
    const users = await db.user.findAll({
      order: [
        // First, order by role
        [db.sequelize.literal(`
          CASE 
            WHEN userType = 'admin' THEN 1
            WHEN userType = 'editor' THEN 2
            ELSE 3
          END
        `), 'ASC'],
        ['createdAt', 'DESC']
      ]
    });
  
    return users;
  });

const dashboardMatrics = asyncHandler(async () => {
    const totalUsers = await db.user.findAndCountAll();
    const totalQuizzes = await db.quiz.findAndCountAll();
    const totalWordsearches = await db.Search.findAndCountAll();
    const totalGuessTheImages = await db.guessWord.findAndCountAll();
    const totalGuessTheWords = await db.guessthewords.findAndCountAll();

    return {
        totalUsers: totalUsers.count,
        totalQuizzes: totalQuizzes.count,
        totalWordsearches: totalWordsearches.count,
        totalGuessTheImages: totalGuessTheImages.count,
        totalGuessTheWords: totalGuessTheWords.count
    };
});

const chartData = async (query) => {
    const { year } = query;
    
    try {
      // Fetch data from the database based on the selected year
      const usersData = await db.user.findAll({
        where: {
          createdAt: {
            [Op.gte]: new Date(`${year}-01-01T00:00:00Z`), // Start of the year
            [Op.lte]: new Date(`${year}-12-31T23:59:59Z`)  // End of the year
          }
        }
      });  
      // Get the current month (0-based, so January is 0)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();      
      // Initialize arrays for labels and data
      const labels = [];
      const values = [];
      
      // Example: Assuming monthly data aggregation
      const monthlyCounts = Array(12).fill(0); // Initialize with zero for each month
  
      // Process data
      usersData.forEach(user => {
        const month = new Date(user.createdAt).getMonth(); // Get month (0-based)
        if (new Date(user.createdAt).getFullYear() === parseInt(year)) {
          monthlyCounts[month] += 1; // Increment count for the month
        }
      });
  
      // Populate labels and values up to the current month
      for (let month = 0; month <= currentMonth; month++) {
        labels.push(new Date(0, month).toLocaleString('default', { month: 'short' })); // Month names
        values.push(monthlyCounts[month]); // Counts
      }
  
      return {
        labels: labels,
        values: values
      };
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw new Error('Error fetching chart data');
    }
  };

const statstics = async()=>{

}

const mostPlayedQuiz = asyncHandler(async () => {
        const quizzes = await db.quiz.findAll({
            attributes: ['quizName', 'totalPlays'],
            order: [['totalPlays', 'DESC']],
            limit: 5
        });
        const labels = quizzes.map(quiz => quiz.quizName);
        const data = quizzes.map(quiz => parseInt(quiz.totalPlays, 10))
        const responseData = {
            labels: labels,
            datasets: [
                {
                    data: data,
                    backgroundColor: ['#FF6384', '#36A2EB', '#8FD14F', '#FFCE56', '#E7E9ED'],
                    borderColor: ['#FF6384', '#36A2EB', '#8FD14F', '#FFCE56', '#E7E9ED'],
                    borderWidth: 1,
                }
            ]
        };
        return responseData
});

const getGamePlayStatistics = asyncHandler(async () => {
    const stats = await db.activity.findAll({
        attributes: [
            'game_category',
            [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'playCount']
        ],
        group: ['game_category']
    });
    const labels = [];
    const data = [];
    stats.forEach(stat => {
        labels.push(stat.game_category);
        data.push(stat.dataValues.playCount);
    });

    return {
        labels,
        data
    };
});

const leaderboard = asyncHandler(async (req, res) => {
    // Get the userId from the query
    const leaderboardData = await db.points.findAll({
        attributes: [
            'userId',
            [db.sequelize.fn('SUM', db.sequelize.col('points')), 'totalPoints']
        ],
        group: ['userId'],
        order: [[db.sequelize.fn('SUM', db.sequelize.col('points')), 'DESC']],
        limit: 10,
        raw: true
    });

    // Check if leaderboard data is available
    if (!leaderboardData.length) {
        throw new ErrorResponse("No leaderboard data found", 404);
    }

    // Fetch user details
    const userIds = leaderboardData.map(data => data.userId);
    const users = await db.user.findAll({
        attributes: ['userId', 'userName'],
        where: {
            userId: userIds
        },
        raw: true
    });

    // Create a map of userId to userName
    const userMap = new Map(users.map(user => [user.userId, user.userName]));

    // Map userId to userName in leaderboardData
    const updatedLeaderboard = leaderboardData.map(item => ({
        userName: userMap.get(item.userId) || 'Unknown User',
        totalPoints: item.totalPoints
    }));

    return updatedLeaderboard

});



export default {getVersion,version,sendNotificationAll,getGamePlayStatistics,leaderboard,mostPlayedQuiz,createUser,updateUser,deleteUser,dashboardMatrics,chartData,statstics,fetchUsers};;
