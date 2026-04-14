import db from "../../config/db.js";
import asyncHandler from "../../middleware/async.js";
import ErrorResponse from "../../utlis/ErrorResponse.js";
import { Sequelize, Op } from "sequelize";
import cron from "node-cron";

// Helper function to get the date range based on type
const getDateRange = (type) => {
    const now = new Date();
    let startDate, endDate;
    switch (type) {
        case 'weekly':
            // Start of the week (Sunday)
            startDate = new Date(now);
            startDate.setDate(now.getDate() - now.getDay());
            startDate.setHours(0, 0, 0, 0);
            // End of the week (Saturday)
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
            break;
        case 'yearly':
            startDate = new Date(now.getFullYear(), 0, 1);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now.getFullYear(), 11, 31);
            endDate.setHours(23, 59, 59, 999);
            break;
        default:
            throw new Error('Invalid type');
    }
    return { startDate, endDate };
};

// Function to calculate and save the weekly winner
const calculateAndSaveWeeklyWinner = asyncHandler(async () => {
    // Get the date range for the previous week
    const { startDate, endDate } = getPreviousWeekDateRange();
  	console.log(startDate,endDate)

    // Fetch all users under 16
    const usersUnder16Ids = await getUsersUnderAge(16);

    if (usersUnder16Ids.length === 0) {
        console.log('No users under 16 found.');
        return;
    }

    // Fetch points for users under 16 in the previous week
    const leaderboard = await db.points.findAll({
        attributes: [
            'userId',
            [Sequelize.fn('SUM', Sequelize.col('points')), 'totalPoints']
        ],
        where: {
            userId: { [Op.in]: usersUnder16Ids },
            createdAt: {
                [Op.between]: [startDate, endDate]
            }
        },
        group: ['userId'],
        order: [[Sequelize.literal('totalPoints'), 'DESC']],
        raw: true
    });

    if (leaderboard.length === 0) {
        console.log('No points earned by users under 16 in the previous week.');
        return;
    }

    // Get the top player
    const topPlayer = leaderboard[0];

    // Check if a weekly winner already exists for this week
    const existingWinner = await db.weeklyWinner.findOne({
        where: {
            weekStartDate: startDate,
            weekEndDate: endDate
        }
    });

    if (existingWinner) {
        console.log('Weekly winner already exists for this week. No new winner saved.');
        return;
    }

    // Save the top under-16 player to the WeeklyWinners record
    await db.weeklyWinner.create({
        userId: topPlayer.userId,
        totalPoints: topPlayer.totalPoints,
        weekStartDate: startDate,
        weekEndDate: endDate,
        createdAt: new Date()
    });

    console.log(`Saved weekly under-16 winner: User ID ${topPlayer.userId}`);
});

// Function to get the previous week's date range
const getPreviousWeekDateRange = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 (Sunday) - 6 (Saturday)

    // Start of previous week (Sunday)
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - dayOfWeek - 7);
    startDate.setHours(0, 0, 0, 0);

    // End of previous week (Saturday)
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
};

cron.schedule('14 1 * * 2', () => {
    console.log('Running weekly winner calculation job');
    calculateAndSaveWeeklyWinner().catch(error => {
        console.error('Error calculating weekly winner:', error);
    });
}, {
    timezone: "Asia/Kolkata"  // Set to Indian Standard Time (IST)
});

cron.schedule('16 1 * * *', () => {
    console.log(`Cron job triggered at ${new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })}`);
    // Add your task logic here
}, {
    timezone: "Asia/Kolkata" // Set to Indian Standard Time (IST)
});

cron.schedule('0 0 * * *', () => {
    calculateAndSaveWeeklyWinner().catch(error => {
        console.error('Error calculating weekly winner:', error);
    });
});

// Fetch Leaderboard function
const fetchLeaderboard = asyncHandler(async (query) => {
    const { type, userId, page = 1, limit = 15 } = query;

    if (!['weekly', 'monthly', 'yearly'].includes(type)) {
        throw new ErrorResponse('Invalid type. Use "weekly", "monthly", or "yearly".', 400);
    }

    const offset = (page - 1) * limit;

    const { startDate, endDate } = getDateRange(type);
    console.log(startDate,endDate);
    

    const whereCondition = {
        createdAt: {
            [Op.between]: [startDate, endDate]
        }
    };

    // ✅ Age filter
    if (userId) {
        const user = await db.user.findOne({
            attributes: ['dob'],
            where: { userId },
            raw: true
        });

        if (!user) {
            throw new ErrorResponse('User not found', 404);
        }

        const age = calculateAge(user.dob);

    }

    // ✅ MAIN QUERY WITH LIMIT + OFFSET
    const leaderboard = await db.points.findAll({
        attributes: [
            'userId',
            [Sequelize.fn('SUM', Sequelize.col('points')), 'totalPoints']
        ],
        where: whereCondition,
        group: ['userId'],
        order: [[Sequelize.literal('totalPoints'), 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        subQuery: false,
        raw: true
    });
    console.log(leaderboard);
    

    // 🔥 IMPORTANT: Get full ranking separately (for correct rank)
    const fullLeaderboard = await db.points.findAll({
        attributes: [
            'userId',
            [Sequelize.fn('SUM', Sequelize.col('points')), 'totalPoints']
        ],
        where: whereCondition,
        group: ['userId'],
        order: [[Sequelize.literal('totalPoints'), 'DESC']],
        raw: true
    });

    const rankMap = {};
    fullLeaderboard.forEach((entry, index) => {
        rankMap[entry.userId] = index + 1;
    });

    const userIds = leaderboard.map(entry => entry.userId);

    const users = await db.user.findAll({
        attributes: ['userId', 'userName', 'profile_avatar', 'dob'],
        where: {
            userId: { [Op.in]: userIds }
        },
        raw: true
    });

    const userMap = users.reduce((acc, user) => {
        acc[user.userId] = user;
        return acc;
    }, {});

    const leaderboardWithRank = leaderboard.map(entry => {
        const user = userMap[entry.userId];
        return {
            userId: entry.userId,
            totalPoints: entry.totalPoints,
            userName: user?.userName || null,
            profile_avatar: user?.profile_avatar || null,
            dob: user?.dob || null,
            rank: rankMap[entry.userId] // ✅ correct global rank
        };
    });

    let currentUserEntry = null;

    if (userId) {
        currentUserEntry = leaderboardWithRank.find(
            user => user.userId == userId
        ) || null;
    }

    return {
        page: parseInt(page),
        limit: parseInt(limit),
        leaderboard: leaderboardWithRank,          // full list
        currentUser: currentUserEntry,             // current user rank
        totalPlayers: leaderboardWithRank.length 
    };
});

// Function to handle score updates
const handleScore = asyncHandler(async (body) => {
    const { userId, points } = body;
    const existingUser = await db.user.findOne({ where: { userId } });
    if (!existingUser) {
        throw new ErrorResponse("User does not exist", 404);
    }
    existingUser.points = Number(existingUser.points || 0) + Number(points);
    await existingUser.save();

    const pointLog = await db.points.create({
        userId,
        points
    });

    return pointLog;
});

// Function to fetch user's total score
const fetchUserScore = asyncHandler(async (query) => {
    const { userId } = query;
    if (!userId) {
        throw new ErrorResponse("User ID is required", 400);
    }
    const userScore = await db.points.findOne({
        attributes: [
            'userId',
            [Sequelize.fn('SUM', Sequelize.col('points')), 'totalPoints']
        ],
        where: { userId },
        group: ['userId'],
        raw: true
    });

    if (!userScore) {
        throw new ErrorResponse("User does not exist or has no points", 404);
    }

    return {
        userId: userScore.userId,
        totalPoints: userScore.totalPoints || 0
    };
});

// Helper function to calculate age from date of birth
const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (
        m < 0 ||
        (m === 0 && today.getDate() < birthDate.getDate())
    ) {
        age--;
    }
    return age;
};

// Helper function to get users under a certain age
const getUsersUnderAge = async (ageLimit) => {
    const users = await db.user.findAll({
        attributes: ['userId'],
        where: Sequelize.where(
            Sequelize.fn(
                'TIMESTAMPDIFF',
                Sequelize.literal('YEAR'),
                Sequelize.col('dob'),
                Sequelize.fn('CURDATE')
            ),
            '<',
            ageLimit
        ),
        raw: true
    });

    return users.map(user => user.userId);
};

// Helper function to get users over a certain age
const getUsersOverAge = async (ageLimit) => {
    const users = await db.user.findAll({
        attributes: ['userId'],
        where: Sequelize.where(
            Sequelize.fn(
                'TIMESTAMPDIFF',
                Sequelize.literal('YEAR'),
                Sequelize.col('dob'),
                Sequelize.fn('CURDATE')
            ),
            '>=',
            ageLimit
        ),
        raw: true
    });

    return users.map(user => user.userId);
};

// Function to fetch the latest weekly winner
const fetchWeeklyWinner = asyncHandler(async () => {
    const weeklyWinner = await db.weeklyWinner.findOne({
        order: [['createdAt', 'DESC']],
        raw: true
    });
    if (!weeklyWinner) {
        throw new ErrorResponse('No weekly winner found', 404);
    }
    const winnerDetails = await db.user.findOne({
        where: { userId: weeklyWinner.userId },
        attributes: ['userId', 'userName', 'profile_avatar'],
        raw: true
    });
    if (!winnerDetails) {
        throw new ErrorResponse('Winner details not found', 404);
    }
    return {
        userId: weeklyWinner.userId,
        userName: winnerDetails.userName,
        profile_avatar: winnerDetails.profile_avatar || "m3t6ya6k-76bsz.jpg",
        totalPoints: weeklyWinner.totalPoints,
        weekStartDate: weeklyWinner.weekStartDate,
        weekEndDate: weeklyWinner.weekEndDate
    };
});

const fetchLastSixWeeklyWinners = asyncHandler(async () => {
    const today = new Date();
    const sixWeeksAgo = new Date(today);
    sixWeeksAgo.setDate(today.getDate() - 42); 

    const weeklyWinners = await db.weeklyWinner.findAll({
        where: {
            weekStartDate: {
                [Op.between]: [sixWeeksAgo, today]
            }
        },
        order: [['weekStartDate', 'DESC']],
        raw: true
    });

    if (!weeklyWinners || weeklyWinners.length === 0) {
        throw new ErrorResponse('No weekly winners found in the last 6 weeks', 404);
    }

    const userIds = weeklyWinners.map(winner => winner.userId);
    const users = await db.user.findAll({
        attributes: ['userId', 'userName', 'profile_avatar'],
        where: {
            userId: { [Op.in]: userIds }
        },
        raw: true
    });

    const userMap = users.reduce((acc, user) => {
        acc[user.userId] = user;
        return acc;
    }, {});

    const result = weeklyWinners.map(winner => ({
        userId: winner.userId,
        totalPoints: winner.totalPoints,
        weekStartDate: winner.weekStartDate,
        weekEndDate: winner.weekEndDate,
        userName: userMap[winner.userId]?.userName || null,
        profile_avatar: userMap[winner.userId]?.profile_avatar || "m3t6sw91-m4pup.jpg"
    }));

    return result;
});


// Exporting the functions for use in other modules
export default {
  	fetchLastSixWeeklyWinners,
  	fetchWeeklyWinner,
    fetchLeaderboard,
    handleScore,
    fetchUserScore,
    fetchWeeklyWinner
};;
