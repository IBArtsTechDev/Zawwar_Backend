import db from "../../config/db.js";
import asyncHandler from "../../middleware/async.js";
import ErrorResponse from "../../utlis/ErrorResponse.js";
import { Op } from "sequelize";
import xlsx from "xlsx";
import path from "path";
import fs from "fs";
const matraData = [ 'ુ', 'ા', '', 'ી', 'ે', 'ૈ', 'ો', '', '્'];

const createWord = asyncHandler(async (body, files) => {
    const { level, word, time, isGujrati } = body;

    // Parse translations JSON string into an array of objects
    let translations;
    try {
        translations = JSON.parse(body.translations);
    } catch (error) {
        throw new ErrorResponse("Invalid translations format. Must be a valid JSON array.", 400);
    }

    if (!Array.isArray(translations)) {
        throw new ErrorResponse("Translations should be an array of objects.", 400);
    }

    if (!level) {
        throw new ErrorResponse("Level is required", 400);
    }

    // Find main image in files
    const mainImage = files.find(file => file.fieldname === 'mainImage');
    if (mainImage) {
        console.log("Main image uploaded:", mainImage.path);
    }

    // Check if a word with this level and language already exists
    const existingWord = await db.guessWord.findOne({
        where: { level, isGujrati: !!isGujrati }
    });

    if (existingWord) {
        throw new ErrorResponse("Game with this level already exists in this language", 400);
    }

    // Save main word data
    const data = {
        level,
        word,
        time:30,
        gameImage: mainImage ? mainImage.filename : null,
        isGujrati: isGujrati || false
    };

    const newWord = await db.guessWord.create(data);
    console.log(JSON.stringify(newWord, null, 2), "newWord as JSON");

    // Process each translation without separate images
    if (translations && Array.isArray(translations)) {
        const translationData = translations.map(translation => ({
            gameId: newWord.gameid,
            language: translation.language,
            word: translation.word,
            translationImage: newWord.gameImage // Use the same image for all translations
        }));

        console.log(translationData,"SSS")
        await db.guessWordTranslation.bulkCreate(translationData);
    }

    return newWord;
});


const updateWord = asyncHandler(async (body, files) => {
    const { level, newLevel, word, noOfPlays, noOfLevels, time, isGujrati } = body;

    // Parse translations JSON string
    let translations;
    try {
        translations = JSON.parse(body.translations);
    } catch (error) {
        throw new ErrorResponse("Invalid translations format. Must be a valid JSON array.", 400);
    }

    if (!Array.isArray(translations)) {
        throw new ErrorResponse("Translations should be an array of objects.", 400);
    }

    if (!level) {
        throw new ErrorResponse("Level is required", 400);
    }

    const isGuj = isGujrati === 'true' || isGujrati === true;

    const existingWord = await db.guessWord.findOne({
        where: { level, isGujrati: isGuj }
    });

    if (!existingWord) {
        throw new ErrorResponse("Game with this level does not exist", 404);
    }

    // Update main image if provided
    const mainImage = files.find(file => file.fieldname === 'mainImage');
    const updateData = {
        level: newLevel !== undefined ? newLevel : existingWord.level,
        time: time !== undefined ? time : existingWord.time,
        word: word !== undefined ? word : existingWord.word,
        noOfPlays: noOfPlays !== undefined ? noOfPlays : existingWord.noOfPlays,
        noOfLevels: noOfLevels !== undefined ? noOfLevels : existingWord.noOfLevels,
        gameImage: mainImage ? mainImage.filename : existingWord.gameImage,
        isGujrati: isGuj
    };

    await existingWord.update(updateData);

    // Update or replace translation records
    if (translations && Array.isArray(translations)) {
        await db.guessWordTranslation.destroy({ where: { gameid: existingWord.gameid } });

        const translationData = translations.map(translation => ({
            gameId: existingWord.gameid,
            language: translation.language,
            word: translation.word,
            translationImage: existingWord.gameImage // Use the updated image for all translations
        }));
        await db.guessWordTranslation.bulkCreate(translationData);
    }

    return existingWord;
});


const playWord = asyncHandler(async (query) => {
    const { userId, page = 1, limit = 30 } = query;
    const pageSize = parseInt(limit, 10);
    const currentPage = parseInt(page, 10);
    const offset = (currentPage - 1) * pageSize;

    const transaction = await db.sequelize.transaction();
    try {
        // Fetch answered questions to exclude
        const answeredQuestions = await db.gameAnswer.findAll({
            attributes: ['gameId'],
            where: { userId, isCorrect: true, type: 'Guess-the-image' },
            transaction,
            raw: true
        });

        const answeredQuestionIds = answeredQuestions
            .map(a => a.gameId)
            .filter(id => id !== undefined && id !== null);

        const excludeIds = answeredQuestionIds.length > 0 ? answeredQuestionIds : [0];

        // Total count excluding answered
        const totalQuestions = await db.guessWord.count({
            where: { gameId: { [Op.notIn]: excludeIds } },
            transaction
        });

        // Fetch paginated words
        const words = await db.guessWord.findAll({
            attributes: ['gameId', 'gameImage', 'level', 'word'],
            where: { gameId: { [Op.notIn]: excludeIds } },
            limit: pageSize,
            offset,
            transaction,
            raw: true
        });

        if (!words.length) {
            throw new ErrorResponse('No more questions available', 404);
        }

        const gameIds = words.map(w => w.gameId);

        // Fetch ALL translations for all languages in one query
        const allTranslations = await db.guessWordTranslation.findAll({
            attributes: ['gameId', 'language', 'word'],
            where: { gameId: { [Op.in]: gameIds } },
            transaction,
            raw: true
        });

        // Map: { gameId -> { English: '...', Gujarati: '...' } }
        const translationsMap = allTranslations.reduce((acc, t) => {
            if (!acc[t.gameId]) acc[t.gameId] = {};
            acc[t.gameId][t.language] = t.word;
            return acc;
        }, {});

        // Shuffle helper
        const shuffleArray = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };

        // Process word into character array per language
        const processWord = (word, lang) => {
            if (lang === 'Gujarati') return processGujaratiText(word);
            return word.replace(/[^A-Za-z]/g, '').split('');
        };

        // Build jumbled word with extra random letters
        const getJumbledWord = (wordArray, lang) => {
            const letters = lang === 'English'
                ? wordArray.map(l => l.toUpperCase())
                : wordArray;

            const randomLetters = lang === 'Gujarati'
                ? 'અઆઇઈઉઊઋએઐઔકગછટઠડઢતદધફબયરલવશષસ'
                : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

            const extraCount = Math.max(0, 9 - letters.length); // Always make total = 9
            const extraLetters = Array.from({ length: extraCount }, () =>
                randomLetters[Math.floor(Math.random() * randomLetters.length)]
            );
            return shuffleArray([...letters, ...extraLetters]);
        };

        // Build language-specific word data
        const buildWordData = (rawWord, lang) => {
            const clean = lang === 'Gujarati'
                ? rawWord.replace(/[^\u0A80-\u0AFF]/g, '').replace(/\s/g, '')
                : rawWord.replace(/[^A-Za-z]/g, '').replace(/\s/g, '');

            const wordArray = processWord(clean, lang);
            const jumbledWord = getJumbledWord(wordArray, lang);

            return {
                word: clean,
                jumbledWord,
                jumbledWordCount: jumbledWord.length
            };
        };

        // Format response with both languages nested
        const formattedData = words.map(wordObj => {
            if (!wordObj.gameId) {
                console.warn(`Word object missing gameId: ${JSON.stringify(wordObj)}`);
                return null;
            }

            const gameTranslations = translationsMap[wordObj.gameId] || {};

            const englishWord = gameTranslations['English'] || wordObj.word;
            const gujaratiWord = gameTranslations['Gujarati'] || null;

            return {
                gameId: wordObj.gameId,
                gameImage: wordObj.gameImage,
                level: wordObj.level,
                languages: {
                    English: buildWordData(englishWord, 'English'),
                    ...(gujaratiWord && {
                        Gujarati: buildWordData(gujaratiWord, 'Gujarati')
                    })
                }
            };
        }).filter(item => item !== null);

        // Record activity for first game
        if (formattedData.length > 0) {
            await db.activity.create({
                gameId: formattedData[0].gameId,
                game_category: 'Guess_Image',
                userId
            }, { transaction });
        }

        await transaction.commit();

        return {
            totalQuestions,
            totalPages: Math.ceil(totalQuestions / pageSize),
            currentPage,
            pageSize,
            searches: formattedData
        };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
});


const processGujaratiText = (text) => {
    const baseCharPattern = /[\u0A80-\u0AFF]/; 
    const matraPattern = /[\u0AB0-\u0ABF\u0AC0-\u0AC9\u0ACA-\u0ACB\u0ACC-\u0ACD]/;

    let splitResult = [];
    let current = '';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (baseCharPattern.test(char)) {
            if (current) {
                splitResult.push(current);
                current = '';
            }
            current += char;
        } else if (matraPattern.test(char)) {
            if (current) {
                current += char;
            } else {
                splitResult.push(char);
            }
        } else {
            if (current) {
                splitResult.push(current);
                current = '';
            }
            splitResult.push(char);
        }
    }
    if (current) {
        splitResult.push(current);
    }

    let result = [];
    for (let i = 0; i < splitResult.length; i++) {
        if (matraData.includes(splitResult[i])) {
            if (result.length > 0 && baseCharPattern.test(result[result.length - 1])) {
                result[result.length - 1] += splitResult[i]; 
            } else {
                result.push(splitResult[i]); 
            }
        } else {
            result.push(splitResult[i]);
        }
    }
    return result;
};


const fetchWords = asyncHandler(async (query) => {
    // Fetch all words regardless of language
    const words = await db.guessWord.findAll({
        attributes: ['gameId', 'gameImage', 'level', 'total_plays', 'word', 'isGujrati']
    });

    const gameIds = words.map(word => word.get('gameId'));

    // Fetch ALL translations for all languages in one query
    const translations = await db.guessWordTranslation.findAll({
        where: { gameId: { [Op.in]: gameIds } },
        attributes: ['gameId', 'language', 'word', 'translationImage']
    });

    // Map translations by gameId -> { language -> { word, translationImage } }
    const translationsMap = new Map();
    translations.forEach(translation => {
        if (!translationsMap.has(translation.gameId)) {
            translationsMap.set(translation.gameId, {});
        }
        translationsMap.get(translation.gameId)[translation.language] = {
            word: translation.word,
            translationImage: translation.translationImage
        };
    });

    // Format words with all language data nested
    const formattedWords = words.map(word => ({
        gameId: word.get('gameId'),
        gameImage: word.get('gameImage'),
        level: word.get('level'),
        totalPlays: word.get('total_plays'),
        languages: {
            English: {
                word: word.get('word'),
                translationImage: word.get('gameImage')
            },
            ...(translationsMap.get(word.get('gameId')) || {})
        }
    }));

    return formattedWords;
});



const deleteWord = asyncHandler(async (query) => {
    const { gameId } = query;
    if (!gameId) {
        throw new ErrorResponse("Game ID is required", 400);
    }

    const word = await db.guessWord.findOne({ where: { gameId } });
    if (!word) {
        throw new ErrorResponse("Game with this ID does not exist", 404);
    }

    await db.guessWordTranslation.destroy({ where: { gameId } }); // Delete associated translations
    await word.destroy();
    return { success: true, message: "Word and its translations deleted successfully" };
});

// Function to process Excel and create games
const createGamesFromExcel = asyncHandler(async (file) => {
    if (!file) {
        throw new ErrorResponse("Excel file is required", 400);
    }

    const filePath = path.resolve(file.path);
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const data = xlsx.utils.sheet_to_json(worksheet);

    const createdGames = [];

    for (const row of data) {
        const { level, word, time, translations } = row;

        // Default time to 15 seconds if not provided
        const gameTime = time || 15;

        // Default `isGujrati` to false
        const isGujrati = false;

        // Parse translations field if it is in JSON format in the Excel.
        let parsedTranslations;
        try {
            parsedTranslations = JSON.parse(translations);
        } catch (error) {
            parsedTranslations = [];
        }
        console.log(parsedTranslations,"SSS")

        // Validate that translations is an array.
        if (!Array.isArray(parsedTranslations)) {
            throw new ErrorResponse("Translations should be a valid JSON array", 400);
        }

        // Check if a word with this level and language already exists.
        const existingWord = await db.guessWord.findOne({
            where: { level, isGujrati }
        });

        if (existingWord) {
            console.log(`Game with level ${level} already exists. Skipping this entry.`);
            continue; // Skip existing games.
        }

        // Create a new game without an image.
        const gameData = {
            level,
            word,
            time: gameTime, // Use the time parsed or the default time.
            gameImage: null, // Image will be uploaded later.
            isGujrati // Default to false.
        };

        const newGame = await db.guessWord.create(gameData);

        // Create translations if provided.
        if (parsedTranslations.length) {
            const translationData = parsedTranslations.map(translation => ({
                gameId: newGame.gameid,
                language: translation.language,
                word: translation.word,
                translationImage: newGame.gameImage // Image will be uploaded later.
            }));
            console.log(translationData)
            await db.guessWordTranslation.bulkCreate(translationData);
        }

        createdGames.push(newGame);
    }

    // Clean up the uploaded file after processing.
    fs.unlinkSync(filePath);

    console.log(`${createdGames.length} games created from the Excel file.`);
    return createdGames;
});





export default {
    createGamesFromExcel,
    updateWord,
    deleteWord,
    createWord,
    playWord,
    fetchWords
};;
