import successResponse from "../../utlis/successResponse.js";
import asyncHandler from "../../middleware/async.js";
import adminService from "../../services/admin/admin.js";

const createUser = asyncHandler(async(req,res)=>{
    const result = await adminService.createUser(req.body)
    res.successResponse = new successResponse("User created successfully",200,result);
});

const version = asyncHandler(async(req,res)=>{
    const result = await adminService.version(req.body);
    res.successResponse = new successResponse("version recorded successfully",200,result)
})

const getVersion = asyncHandler(async(req,res)=>{
    const result = await adminService.getVersion(req.query);
    res.successResponse = new successResponse("Versions fetched successfully",200,result);
})

const sendNotificationAll = asyncHandler(async(req,res)=>{
    const result = await adminService.sendNotificationAll(req.body);
    res.successResponse = new successResponse("Notification send successfully",200,result)
})

const getGamePlayStatistics = asyncHandler(async(req,res)=>{
    const result = await adminService.getGamePlayStatistics()
    res.successResponse = new successResponse("Game stats fetched successfully",200,result)
})

const mostPlayedQuiz = asyncHandler(async(req,res)=>{
    const result = await adminService.mostPlayedQuiz();
    res.successResponse = new successResponse("Most played quiz data fetched",200,result)
})

const leaderboard = asyncHandler(async(req,res)=>{
    const result = await adminService.leaderboard();
    res.successResponse = new successResponse("leaderboard fetched successfully",200,result)
})

const updateUser = asyncHandler(async(req,res)=>{
    const result = await adminService.updateUser(req.query,req.body);
    res.successResponse = new successResponse("User Updated Successfully",200,result);
});

const chartData = asyncHandler(async(req,res)=>{
    const result = await adminService.chartData(req.query)
    res.successResponse = new successResponse("chart data",200,result)
})

const dashboardMatrics = asyncHandler(async(req,res)=>{
    const result = await adminService.dashboardMatrics();
    res.successResponse = new successResponse("Dashboard analytics",200,result)
})

const deleteUser = asyncHandler(async(req,res)=>{
    const result = await adminService.deleteUser(req.query);
    res.successResponse = new successResponse("User deleted successfully",200,result);
});

const fetchUser = asyncHandler(async(req,res)=>{
    const result = await adminService.fetchUsers();
    res.successResponse = new successResponse("Users fetched successfully",200,result);
})

export default {
      version,
    getVersion,
  sendNotificationAll,
  	getGamePlayStatistics,
  	mostPlayedQuiz,
  	leaderboard,
  	dashboardMatrics,
  	chartData,
    createUser,
    updateUser,
    deleteUser,
    fetchUser
};;
