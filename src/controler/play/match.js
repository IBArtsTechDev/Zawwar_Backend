    import asyncHandler from "../../middleware/async.js";
    import matchControler from "../../services/play/newMatch.js";
    import SuccessResponse from "../../utlis/successResponse.js";

    // Play a match
    const playMatch = asyncHandler(async (req, res) => {
        const result = await matchControler.playMatch(req.query);  // Make sure the service returns the result
        res.status(200).json(new SuccessResponse("Match fetched successfully", 200, result));
    });

    // Create a new match
    const createMatch = asyncHandler(async (req, res) => {
        const result = await matchControler.createMatch(req.body, req.files);  // Include files if image upload is handled
        res.status(200).json(new SuccessResponse("Match created successfully", 200, result));
    });

    const getMatches= asyncHandler(async(req,res)=>{
        const result = await matchControler.getAllMatches(req.query);  // Make sure the service returns
        res.status(200).json(new SuccessResponse("Matches fetched successfully", 200, result));
    })

    // Get a match by ID
    const getMatch = asyncHandler(async (req, res) => {
        const result = await matchControler.getMatch(req.params.id);  // Fetch match by ID
        res.status(200).json(new SuccessResponse("Match fetched successfully", 200, result));
    });

    // Update a match by ID
    const updateMatch = asyncHandler(async (req, res, next) => {
        // Call the updateMatch function from your matchController
        const result = await matchControler.updateMatch(req.params, req.body, req.files);
        // Send a successful response
        res.status(200).json({
            success: true,
            message: "Match updated successfully",
            data: result,
        });
        });

    // Delete a match by ID
    const deleteMatch = asyncHandler(async (req, res) => {
    const result = await matchControler.deleteMatch(req.params);  // Delete match by ID
    res.status(200).json(new SuccessResponse("Match deleted successfully", 200, result));
    });

    const uploadMatchesFromExcel = asyncHandler(async(req,res)=>{
        console.log(req.file,"SSSSS")
        const result = await  matchControler.uploadMatchesFromExcel(req.file);  // Make sure the service returns the result
        res.status(200).json(new SuccessResponse("Matches uploaded successfully", 200, result));
    })

    export default {
        uploadMatchesFromExcel,
        getMatches,
        playMatch,
        createMatch,
        getMatch,
        updateMatch,
        deleteMatch
    };;
