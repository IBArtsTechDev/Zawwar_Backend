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
    const { lang, userId, page = 1, limit = 30 } = query;
    const pageSize = parseInt(limit, 10);
    const currentPage = parseInt(page, 10);

    // Mapping of language short codes to full language names
    const langCodeMap = {
        'en': 'English',
        'guj': 'Gujarati',
        'es': 'Spanish' // Add more languages if needed
    };

    // Validate and get full language name
    const fullLang = langCodeMap[lang?.toLowerCase()];
    if (!fullLang) {
        throw new ErrorResponse(`Invalid language parameter. Choose one of: ${Object.keys(langCodeMap).join(', ')}`, 400);
    }

    const offset = (currentPage - 1) * pageSize;

    // Start a transaction for atomic operations
    const transaction = await db.sequelize.transaction();
    try {
        // Fetch the answered questions by the user to exclude them from the next set of questions.
        const answeredQuestions = await db.gameAnswer.findAll({
            attributes: ['gameId'],
            where: {
                userId,
                isCorrect: true,
                type: 'Guess-the-image'
            },
            transaction,
            raw: true
        });

        const answeredQuestionIds = answeredQuestions.map(answer => answer.gameId).filter(id => id !== undefined && id !== null);

        // Define language-specific conditions
        const includeCondition = fullLang === 'Gujarati' ? { isGujarati: true } : { isGujarati: false };

        // Fetch total count of questions excluding those already answered.
        const totalQuestions = await db.guessWord.count({
            where: {
                gameId: { [Op.notIn]: answeredQuestionIds.length > 0 ? answeredQuestionIds : [0] } // Prevent empty array issue
            },
            transaction
        });

        // Fetch the questions for the current page.
        const words = await db.guessWord.findAll({
            attributes: ['gameId', 'gameImage', 'level', 'word'],
            where: {
                gameId: { [Op.notIn]: answeredQuestionIds.length > 0 ? answeredQuestionIds : [0] } // Prevent empty array issue
            },
            limit: pageSize,
            offset: offset,
            transaction,
            raw: true // Ensures plain objects
        });
        console.log(words, "Fetched Words");

        if (!words.length) {
            throw new ErrorResponse('No more questions available', 404);
        }

        // Create a map for translations if the language is not English.
        let translationsMap = new Map();
        if (fullLang !== 'English') {
            const gameIds = words.map(word => word.gameId);
            const translations = await db.guessWordTranslation.findAll({
                attributes: ['gameId', 'word'],
                where: {
                    gameId: { [Op.in]: gameIds },
                    language: fullLang
                },
                transaction,
                raw: true
            });

            // Store translations in a map for easier access.
            translations.forEach(translation => {
                translationsMap.set(translation.gameId, translation.word);
            });
        }

        // Function to shuffle an array.
        const shuffleArray = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };

        // Function to process words based on language.
        const processWord = (word, lang) => {
            if (lang === 'Gujarati') {
                return processGujaratiText(word);
            } else if (lang === 'English') {
                return word.replace(/[^A-Za-z]/g, '').split('');
            }
            return word.replace(/\s/g, '').split(''); // Default processing
        };

        // Function to get a jumbled word.
        const getJumbledWord = (wordArray, lang) => {
            const letters = lang === 'English' 
                ? wordArray.map(letter => letter.toUpperCase()) 
                : wordArray;
            
            const randomLetters = lang === 'Gujarati' 
                ? 'અઆઇઈઉઊઋએઐઔકગછટઠડઢતદધફબયરલવશષસ' 
                : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            
            const extraLetters = Array.from({ length: 5 }, () => randomLetters[Math.floor(Math.random() * randomLetters.length)]);
            const allLetters = [...letters, ...extraLetters];
            return shuffleArray(allLetters);
        };

        // Format the data to include jumbled words and the correct image for each question.
        const formattedData = words.map(wordObj => {
            if (!wordObj.gameId) {
                console.warn(`Word object missing gameId: ${JSON.stringify(wordObj)}`);
                return null; // Exclude this entry
            }
            const translationWord = translationsMap.get(wordObj.gameId);
            const word = fullLang !== 'English' && translationWord ? translationWord : wordObj.word;
            const image = wordObj.gameImage; // Use the same image for all translations.
            const cleanWord = word.replace(/[^A-Za-z\u0A80-\u0AFF]/g, '').replace(/\s/g, '');
            const wordArray = processWord(cleanWord, fullLang);
            const jumbledWord = getJumbledWord(wordArray, fullLang);
            return {
                gameId: wordObj.gameId,
                gameImage: image,
                level: wordObj.level,
                word: cleanWord,
                jumbledWord,
                jumbledWordCount: jumbledWord.length
            };
        }).filter(item => item !== null); // Remove null entries

        console.log(formattedData, "Formatted Data");

        // Record the activity of the user for the first question.
        if (formattedData.length > 0) {
            await db.activity.create({
                gameId: formattedData[0].gameId,
                game_category: 'Guess_Image',
                userId
            }, { transaction });
        }

        const totalPages = Math.ceil(totalQuestions / pageSize);

        // Commit the transaction after successful operations
        await transaction.commit();

        // Return the formatted data along with pagination information.
        return {
            totalQuestions,
            totalPages,
            currentPage,
            pageSize,
            searches: formattedData
        };

    } catch (error) {
        // Rollback the transaction in case of any errors
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
    const { lang } = query || {};
    let whereCondition = {};
    if (lang === 'guj') {
        whereCondition.isGujrati = true;
    } else if (lang === 'en') {
        whereCondition.isGujrati = false;
    }

    // Fetch words with correct attribute names
    const words = await db.guessWord.findAll({
        where: whereCondition,
        attributes: ['gameId', 'gameImage', 'level', 'total_plays', 'word', 'isGujrati']
    });

    // Extract gameIds using the correct getter
    const gameIds = words.map(word => word.get('gameId')); // Using getter
    console.log(gameIds, "@@@@");

    // Fetch translations using 'gameId' instead of 'gameid'
    const translations = await db.guessWordTranslation.findAll({
        where: { gameId: { [Op.in]: gameIds } }, // Correct attribute name
        attributes: ['gameId', 'language', 'word', 'translationImage'] // Correct attribute name
    });

    // Map translations to their respective gameIds
    const translationsMap = new Map();
    translations.forEach(translation => {
        if (!translationsMap.has(translation.gameId)) { // Correct attribute name
            translationsMap.set(translation.gameId, []);
        }
        translationsMap.get(translation.gameId).push({
            language: translation.language,
            word: translation.word,
            translationImage: translation.translationImage
        });
    });

    // Format words with their translations
    const formattedWords = words.map(word => ({
        gameId: word.get('gameId'), // Use getter for consistency
        gameImage: word.get('gameImage'),
        level: word.get('level'),
        totalPlays: word.get('total_plays'),
        word: word.get('word'),
        isGujrati: word.get('isGujrati'),
        translations: translationsMap.get(word.get('gameId')) || [] 
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
