import asyncHandler from "../../middleware/async.js";
import db from "../../config/db.js";
import ErrorResponse from "../../utlis/ErrorResponse.js";

const createResult = asyncHandler(async (body) => {
    const { userId, gameId, points, type } = body;
    const existingResult = await db.result.findOne({
        where: {
            userId,
            gameId,
            type
        }
    });
    if (existingResult) {
        throw new ErrorResponse("Results already present for this game", 400);
    }
    const result = await db.result.create(body);
    const user = await db.user.findOne({
        where: { userId }
    });

    if (user) {
        user.points += points;
        await user.save();
    }
    await db.progress.destroy({
        where: {
            userId,
            gameId,
        }
    });
    return result;
});

const updateResult = asyncHandler(async (query, body) => {
    const { id } = query;
    const existingResult = await db.result.findOne({
        where: { id }
    });

    if (!existingResult) {
        throw new ErrorResponse("Result does not exist", 404);
    }
    await existingResult.update(body);

    return existingResult;
});

const gameAnswer = asyncHandler(async (body) => {
    const { userId, gameId, isCorrect, type } = body;
    console.log(body);

    const transaction = await db.sequelize.transaction();

    try {
        // Check if the user exists
        const existingUser = await db.user.findOne({ where: { userId }, transaction });
        if (!existingUser) {
            throw new ErrorResponse("User does not exist", 404);
        }

        // Fetch the game based on the type
        let game;
        switch (type) {
            case 'Guess-the-image':
                game = await db.guessWord.findOne({ where: { gameId }, transaction });
                break;
            case 'Guess-the-word':
                game = await db.guessthewords.findOne({ where: { gameId }, transaction });
                break;
            case 'Word-search':
                game = await db.Search.findOne({ where: { gameId }, transaction });
                break;
            case 'match-the-following':
                game = await db.match.findOne({ where: { gameId }, transaction });
           /*      console.log(game,"ddd") */
                break;
            default:
                throw new ErrorResponse("Game type is invalid", 400);
        }

        if (!game) {
            throw new ErrorResponse("Game does not exist", 404);
        }

        // Increment the total plays
        game.total_plays += 1;
        await game.save({ transaction });

        // Check if the answer already exists based on the game type
        let existingAnswer;
        console.log(type, "DDD");
        switch (type) {
            case 'Guess-the-image':
                existingAnswer = await db.gameAnswer.findOne({
                    where: { userId, gameId, type: 'Guess-the-image' },
                    transaction
                });
                break; // Ensure break after each case
        
            case 'Guess-the-word':
                existingAnswer = await db.gameAnswer.findOne({
                    where: { userId, gameId, type: 'Guess-the-word' },
                    transaction
                });
                break; // Ensure break after each case
        
            case 'Word-search':
                existingAnswer = await db.gameAnswer.findOne({
                    where: { userId, gameId, type: 'Word-search' },
                    transaction
                });
                break; // Ensure break after each case
        
            case 'match-the-following':
                existingAnswer = await db.gameAnswer.findOne({
                    where: { userId, gameId, type: 'match-the-following' },
                    transaction
                });
                break; // Ensure break after each case
        
            default:
                throw new ErrorResponse("Invalid game type for answer check", 400);
        }
        

        if (existingAnswer) {
            throw new ErrorResponse(`Answer for this game type already exists`, 400);
        }
		console.log(body);
        // Save the answer
        const newGameAnswer = await db.gameAnswer.create({ ...body, transaction });
      

        // Commit the transaction
        await transaction.commit();

        return newGameAnswer;
    } catch (error) {
        // Rollback the transaction in case of error
        if (transaction) {
            await transaction.rollback();
        }
        throw error;
    }
});




export default {
    createResult,
    updateResult,
    gameAnswer
};;