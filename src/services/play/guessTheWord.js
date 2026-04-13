import db from "../../config/db.js";
import asyncHandler from "../../middleware/async.js";
import ErrorResponse from "../../utlis/ErrorResponse.js";
import { Op } from "sequelize";

const createGuessWord = asyncHandler(async (body, files) => {
    const { level, correctWord, time, isGujrati = false } = body; // Default isGujrati to false if not provided

    // Validate required fields
    if (!level || !correctWord || !time) {
        throw new ErrorResponse("Level, correctWord, and time are required", 400);
    }

    // Start a transaction
    const transaction = await db.sequelize.transaction();

    try {
        // Check for existing word with the same level and isGujrati
        const existingWord = await db.GuessTheWord.findOne({
            where: {
                level,
                isGujrati: typeof isGujrati === 'string' ? isGujrati.toLowerCase() === 'true' : Boolean(isGujrati)
            },
            transaction
        });

        if (existingWord) {
            throw new ErrorResponse("Word already exists for the specified level and language", 400);
        }

        // Create new GuessTheWord entry
        const data = {
            level,
            correctWord,
            time,
            isGujrati: typeof isGujrati === 'string' ? isGujrati.toLowerCase() === 'true' : Boolean(isGujrati)
        };
        const newWord = await db.GuessTheWord.create(data, { transaction });

        // Handle image uploads if files are provided
        if (files) {
            const imageFiles = ['image1', 'image2', 'image3', 'image4'];
            for (const fileKey of imageFiles) {
                if (files[fileKey] && files[fileKey][0]) {
                    const filename = files[fileKey][0].filename;
                    await db.image.create({
                        image: filename,
                        gameId: newWord.gameId // Assuming gameId is the primary key of the newWord
                    }, { transaction });
                }
            }
        }

        // Commit the transaction
        await transaction.commit();

        return newWord;

    } catch (error) {
        // Rollback transaction in case of error
        await transaction.rollback();
        throw error;
    }
});


const updateGuessWord = asyncHandler(async (body, files, query) => {
    const { gameId } = query;
    const { level, correctWord, time, isGujrati, image1Id, image2Id, image3Id, image4Id } = body;

    if (!gameId) {
        throw new ErrorResponse("Game ID is required", 400);
    }

    const transaction = await db.sequelize.transaction();

    try {
        const existingWord = await db.GuessTheWord.findOne({ where: { gameId }, transaction });
        if (!existingWord) {
            throw new ErrorResponse("Game with this ID does not exist", 404);
        }
        const updateData = {
            level: level || existingWord.level,
            correctWord: correctWord !== undefined ? correctWord : existingWord.correctWord,
            time: time !== undefined ? time : existingWord.time,
            isGujrati: isGujrati !== undefined ? isGujrati : existingWord.isGujrati,
        };

        await existingWord.update(updateData, { transaction });
        const imageFiles = [
            { file: files?.image1, id: image1Id },
            { file: files?.image2, id: image2Id },
            { file: files?.image3, id: image3Id },
            { file: files?.image4, id: image4Id },
        ];

        for (const { file, id } of imageFiles) {
            if (file) {
                const imageUri = file[0].filename;

                if (id && id != 'undefined') {
                    await db.image.update(
                        { image: imageUri },
                        { where: { id }, transaction }
                    );
                } else {
                    await db.image.create(
                        { image: imageUri, gameId },
                        { transaction }
                    );
                }
            }
        }
        await transaction.commit();

        return existingWord;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
});
const fetchGuessWord = asyncHandler(async (query) => {
    let whereCondition = {};
    if (query && query.lang) {
        const { lang } = query;

        if (lang === 'guj') {
            whereCondition.isGujrati = true;
        } else if (lang === 'en') {
            whereCondition.isGujrati = false;
        }
    }
    const words = await db.GuessTheWord.findAll({
        where: whereCondition,
        attributes: ['gameId', 'level', 'correctWord', 'time', 'isGujrati'] 
    });
    const gameIds = words.map(word => word.gameId);
    const images = await db.image.findAll({
        where: {
            gameId: { [Op.in]: gameIds }
        }
    });
    const imagesByGameId = images.reduce((acc, image) => {
        if (!acc[image.gameId]) {
            acc[image.gameId] = [];
        }
        acc[image.gameId].push({ id: image.id, url: image.image });     
        return acc;
    }, {});

    const result = words.map(word => ({
        gameId: word.gameId,
        level: word.level,
        correctWord: word.correctWord,
        time: word.time,
        isGujrati: word.isGujrati,
        images: imagesByGameId[word.gameId] || [] 
    }));

    return result;
});
const deleteGuessWord = asyncHandler(async (query) => {
    const { gameId } = query;
    console.log(query);

    if (!gameId) {
        throw new ErrorResponse("Game ID is required", 400);
    }

    const word = await db.GuessTheWord.findOne({ where: { gameId } });
    if (!word) {
        throw new ErrorResponse("Game with this ID does not exist", 404);
    }

    await word.destroy();
    return { success: true, message: "Word deleted successfully" };
});

const playGuessWord = asyncHandler(async (query) => {
    const { lang, userId } = query;
    if (lang !== 'guj' && lang !== 'en') {
        throw new Error('Invalid language parameter');
    }
    const answeredQuestions = await db.gameAnswer.findAll({
        attributes: ['gameId'],
        where: {
            userId,
            isCorrect: true
        }
    });

    const answeredQuestionIds = answeredQuestions.map(answer => answer.gameId);
    let includeCondition = {};
    if (lang === 'guj') {
        includeCondition = { isGujrati: true };
    } else if (lang === 'en') {
        includeCondition = { isGujrati: false };
    }
    const words = await db.GuessTheWord.findAll({
        attributes: ['gameId', 'level', 'correctWord', 'time'],
        where: {
            ...includeCondition,
            gameId: { [Op.notIn]: answeredQuestionIds }
        }
    });
    const gameIds = words.map(word => word.gameId);
    const images = await db.image.findAll({
        where: {
            gameId: { [Op.in]: gameIds }
        }
    });
    const imagesByGameId = images.reduce((acc, image) => {
        if (!acc[image.gameId]) {
            acc[image.gameId] = [];
        }
        acc[image.gameId].push(image.image);
        return acc;
    }, {});
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };
    const getJumbledWord = (word, lang) => {
        let cleanWord;
        if (lang === 'guj') {
            cleanWord = word.replace(/[^અ-હ]/g, '');
        } else if (lang === 'en') {
            cleanWord = word.replace(/[^A-Za-z]/g, '');
        } else {
            throw new Error('Invalid language parameter for jumbled word');
        }

        const letters = cleanWord.split('');
        const randomLetters = lang === 'guj'
            ? 'અઆઈઉઊએઐઓઔકખઘચછજટઠડતથદધનપફબભમલવશષસ'
            : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const extraLetters = Array.from({ length: 5 }, () => randomLetters[Math.floor(Math.random() * randomLetters.length)]);
        const allLetters = [...letters, ...extraLetters];
        const shuffledLetters = shuffleArray(allLetters);

        return shuffledLetters;
    };
    const getRandomHints = (word) => {
        const indices = [];
        const hints = {};
        while (indices.length < 2) {
            const randomIndex = Math.floor(Math.random() * word.length);
            if (!indices.includes(randomIndex)) {
                indices.push(randomIndex);
            }
        }
        indices.forEach(index => {
            hints[index + 1] = word[index];
        });

        return hints;
    };
    const result = words.map(wordEntry => {
        const originalWord = wordEntry.correctWord.toUpperCase();
        const jumbledLetters = getJumbledWord(originalWord, lang);
        return {
            images: imagesByGameId[wordEntry.gameId] || [],
            seconds: 15,
            count: jumbledLetters.length,
            answer: originalWord,
            hint: getRandomHints(originalWord),
            letters: jumbledLetters.map(letter => letter.toUpperCase())
        };
    });

    return result;
});


export default {
    createGuessWord,
    updateGuessWord,
    fetchGuessWord,
    deleteGuessWord,
    playGuessWord
};;
