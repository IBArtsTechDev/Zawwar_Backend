import db from "../../config/db.js";
import asyncHandler from "../../middleware/async.js";
import ErrorResponse from "../../utlis/ErrorResponse.js";
import { Op } from "sequelize";
import fs from "fs";
import path from "path";
import getEnv from "../../config/envReader.js";
const baseURL = "http://localhost:9000"

const createGuessWord = asyncHandler(async (body, files) => {
    console.log(body);
    const { level, word, isGujrati = false, correctImage, translations } = body; // Removed 'correctWord'

    // Validate required fields
    if (!level || typeof isGujrati === 'undefined' || !correctImage) {
        throw new ErrorResponse("level, isGujrati, and correctImage are required", 400); // Updated error message
    }

    // Handle images
    const images = files['image1'] || [];
    const image2 = files['image2'] || [];
    const image3 = files['image3'] || [];
    const image4 = files['image4'] || [];
    const allImages = [...images, ...image2, ...image3, ...image4];
    if (allImages.length === 0) {
        throw new ErrorResponse("At least one image file is required", 400);
    }

    // Parse translations JSON string into an array of objects
    let parsedTranslations = [];
    if (translations) {
        try {
            parsedTranslations = JSON.parse(translations);
            console.log(parsedTranslations, "this is the parsed translation");
             console.log(typeof parsedTranslations);
            if (!Array.isArray(parsedTranslations)) {
                throw new Error();
            }
            // Validate each translation object
            parsedTranslations.forEach((translation, index) => {
                console.log(typeof translation);
                
                if (
                    typeof translation !== 'object' ||
                    !translation.language ||
                    !translation.word
                ) {
                    throw new Error(`Invalid translation format at index ${index}`);
                }
            });
        } catch (error) {
            throw new ErrorResponse("Invalid translations format. Must be a valid JSON array of objects with 'language' and 'word'.", 400);
        }
    }
    console.log(parsedTranslations, "SSSS");

    const isGujratiValue = isGujrati === 'true' || isGujrati === true;

    // Validate correctImage
    if (correctImage < 1 || correctImage > allImages.length) {
        throw new ErrorResponse(`correctImage must be between 1 and ${allImages.length}`, 400);
    }

    const transaction = await db.sequelize.transaction();
    try {
        // Check for existing entry
        const existingGuessWord = await db.guessthewords.findOne({
            where: {
                level,
                isGujrati: isGujratiValue, 
            },
            transaction 
        });

        if (existingGuessWord) {
            throw new ErrorResponse(`A GuessTheWord entry with level "${level}" already exists in the same language.`, 400);
        }

        // Create main GuessTheWord entry
        const guessWord = await db.guessthewords.create({
            level,
            word: word,
            correct_Image: correctImage,
            isGujrati: isGujratiValue,
        }, { transaction });

        // Handle images
        const imagePromises = allImages.map((file, index) => {
            return db.image.create({
                imageNo: index + 1, 
                image: file.filename,
                gameId: guessWord.gameId, 
            }, { transaction });
        });
        await Promise.all(imagePromises); 

        // Handle translations
        if (parsedTranslations.length > 0) {
            const translationPromises = parsedTranslations.map(translation => {
                const { language, word: translationWord } = translation; // Changed 'translationWord' to 'word'
                console.log(translationWord, "fffff");
                if (!language || !translationWord) {
                    throw new ErrorResponse("Each translation must include language and word.", 400);
                }
                return db.GuessTheWordTranslation.create({
                    gameId: guessWord.gameId,
                    language: language, // Normalize language to lowercase,
                    translationWord: translationWord
                }, { transaction });
            });
            await Promise.all(translationPromises);
        }

        await transaction.commit();
        return guessWord;

    } catch (error) {
        await transaction.rollback();
        // If the error is already an instance of ErrorResponse, rethrow it
        if (error instanceof ErrorResponse) {
            throw error;
        }
        throw new ErrorResponse(`Failed to create GuessTheWord: ${error.message}`, 500);
    }
});


const updateGuessWord = asyncHandler(async (body, files, query) => {
    const { gameId } = query;
    const { level, word, isGujrati, correctImage, image1Id, image2Id, image3Id, image4Id, translations } = body; // Removed 'correctWord'

    if (!gameId) {
        throw new ErrorResponse("Game ID is required", 400);
    }

    // Parse translations if it's in JSON format
    let parsedTranslations = [];
    if (translations) {
        try {
            parsedTranslations = JSON.parse(translations);
            if (!Array.isArray(parsedTranslations)) {
                throw new Error();
            }
            // Validate each translation object
            parsedTranslations.forEach((translation, index) => {
                if (
                    typeof translation !== 'object' ||
                    !translation.language ||
                    !translation.word
                ) {
                    throw new Error(`Invalid translation format at index ${index}`);
                }
            });
        } catch (error) {
            throw new ErrorResponse("Invalid translations format. Must be a valid JSON array of objects with 'language' and 'word'.", 400);
        }
    }

    const transaction = await db.sequelize.transaction();
    try {
        const existingWord = await db.guessthewords.findOne({ where: { gameId }, transaction });
        if (!existingWord) {
            throw new ErrorResponse("Game with this ID does not exist", 404);
        }

        // Prepare update data, ensuring that undefined fields are not overwritten
        const updateData = {
            level: level || existingWord.level,
            word: word !== undefined ? word : existingWord.word,
            isGujrati: isGujrati !== undefined ? isGujrati : existingWord.isGujrati,
            correct_Image: correctImage !== undefined ? correctImage : existingWord.correct_Image
        };

        // Validate correctImage if it's being updated
        if (correctImage !== undefined) {
            // Determine the total number of images after update
            let totalImages = 0;
            if (files) {
                totalImages = Object.keys(files).filter(key => key.startsWith('image')).length;
            } else {
                // If no new images are uploaded, count existing images
                const existingImages = await db.image.findAll({ where: { gameId }, transaction });
                totalImages = existingImages.length;
            }

            // If updating correctImage, ensure it's within the valid range
            
        }

        await existingWord.update(updateData, { transaction });

        // Update translations
        if (parsedTranslations.length > 0) {
            // Fetch existing translations for the gameId
            const existingTranslations = await db.GuessTheWordTranslation.findAll({
                where: { gameId },
                transaction
            });

            const existingLanguages = existingTranslations.map(t => t.language.toLowerCase());

            // Process each translation in parsedTranslations
            const translationPromises = parsedTranslations.map(translation => {
                const { language, word: translationWord } = translation;

                if (!language || !translationWord) {
                    throw new ErrorResponse("Each translation must include language and word.", 400);
                }

                const normalizedLanguage = language

                if (existingLanguages.includes(normalizedLanguage)) {
                    // If translation exists, update it
                    return db.GuessTheWordTranslation.update(
                        { translationWord },
                        {
                            where: { gameId, language: normalizedLanguage },
                            transaction
                        }
                    );
                } else {
                    // If translation doesn't exist, create a new one
                    return db.GuessTheWordTranslation.create(
                        {
                            gameId,
                            language: normalizedLanguage,
                            translationWord
                        },
                        { transaction }
                    );
                }
            });

            await Promise.all(translationPromises);
        }

        // Update image files if provided
        const imageFiles = [
            { file: files?.image1, id: image1Id },
            { file: files?.image2, id: image2Id },
            { file: files?.image3, id: image3Id },
            { file: files?.image4, id: image4Id },
        ];

        const imagePromises = imageFiles.map(({ file, id }, index) => {
            if (file && file.length > 0) { // Ensure there's at least one file
                const imageUri = file[0].filename;
                if (id && id !== 'undefined') {
                    // Update existing image if ID is provided
                    return db.image.update(
                        { image: imageUri },
                        { where: { id }, transaction }
                    );
                } else {
                    // Create new image with imageNo and gameId if no ID is provided
                    return db.image.create(
                        {
                            imageNo: index + 1, // Ensure imageNo is set
                            image: imageUri,
                            gameId
                        },
                        { transaction }
                    );
                }
            }
            return Promise.resolve();
        });

        await Promise.all(imagePromises);

        await transaction.commit();
        return existingWord;
    } catch (error) {
        await transaction.rollback();
        // If the error is already an instance of ErrorResponse, rethrow it
        if (error instanceof ErrorResponse) {
            throw error;
        }
        throw new ErrorResponse(`Failed to update GuessTheWord: ${error.message}`, 500);
    }
});


// Mapping of language short codes to full language names
// Mapping of language short codes to full language names
const langCodeMap = {
    'en': 'English',
    'guj': 'Gujarati',
    'es': 'Spanish' // Add more languages if needed
};

// controllers/guessTheWordController.js
const fetchGuessWord = asyncHandler(async (query) => {
    let whereCondition = {};
    if (query && query.lang) {
        const { lang } = query;
        whereCondition.isGujrati = lang.toLowerCase() === 'guj';
    }

    // Fetch words with necessary attributes
    const words = await db.guessthewords.findAll({
        where: whereCondition,
        attributes: ['gameId', 'level', 'word', 'correct_Image', 'isGujrati', 'total_plays']
    });

    if (!words.length) {
        return []; // No words found
    }

    const gameIds = words.map(word => word.gameId);

    // Fetch translations with 'language' field
    const translations = await db.GuessTheWordTranslation.findAll({
        where: {
            gameId: { [Op.in]: gameIds },
        },
        attributes: ['gameId', 'language', 'translationWord'] // Include 'language'
    });

    // Build the mapping of translations by gameId
    const translationsByGameId = {};
    translations.forEach((translation) => {
        const gameId = String(translation.gameId);
        if (gameId && translation.translationWord && translation.language) {
            if (!translationsByGameId[gameId]) {
                translationsByGameId[gameId] = [];
            }
            translationsByGameId[gameId].push({
                language: translation.language.toLowerCase(),
                word: translation.translationWord,
            });
        } else {
            console.warn('Invalid translation data:', translation);
        }
    });

    // Fetch images associated with the words
    const images = await db.image.findAll({
        where: { gameId: { [Op.in]: gameIds } },
        attributes: ['id', 'gameId', 'image']
    });

    // Organize images by gameId
    const imagesByGameId = images.reduce((acc, image) => {
        if (!acc[image.gameId]) acc[image.gameId] = [];
        acc[image.gameId].push({ id: image.id, url: `${image.image}` });
        return acc;
    }, {});

    // Map the final result
  console.log(JSON.stringify(words));
    const result = words.map(word => ({
        gameId: word.gameId,
        level: word.level,
        word: word.word || "No word found",
        correctImage: word.correct_Image,
        isGujrati: word.isGujrati,
        translations: translationsByGameId[word.gameId] || [], // Array of translation objects
        images: imagesByGameId[word.gameId] || [],
        total_plays: word.total_plays
    }));

    return result;
});

const createJumbledWord = (wordArray, lang,length) => {
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };
    const letters = lang === 'English'
        ? wordArray.map(l => l.toUpperCase())
        : wordArray;

    const randomLetters = lang === 'Gujarati'
        ? 'અઆઇઈઉઊઋએઐઔકગછટઠડઢતદધફબયરલવશષસ'
        : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    const extraCount = Math.max(0, length - letters.length); // Always make total = 9
    const extraLetters = Array.from({ length: extraCount }, () =>
        randomLetters[Math.floor(Math.random() * randomLetters.length)]
    );
    return shuffleArray([...letters, ...extraLetters]);
};


const playGuessWord = asyncHandler(async (query) => {
    const { userId, page = 1, limit = 30 } = query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (isNaN(pageNum) || pageNum < 1)
        throw new ErrorResponse("Page number must be a positive integer.", 400);
    if (isNaN(limitNum) || limitNum < 1)
        throw new ErrorResponse("Limit must be a positive integer.", 400);

    // Fetch answered questions by the user
    const answeredQuestions = await db.gameAnswer.findAll({
        attributes: ['gameId'],
        where: { userId, isCorrect: true, type: 'Guess-the-word' }
    });
    const answeredQuestionIds = answeredQuestions.map(answer => answer.gameId);

    // Count total available questions excluding answered ones
    const totalQuestions = await db.guessthewords.count({
        where: { gameId: { [Op.notIn]: answeredQuestionIds } }
    });

    // Fetch words to be played
    const words = await db.guessthewords.findAll({
        attributes: ['gameId', 'level', 'word', 'correct_Image'],
        where: { gameId: { [Op.notIn]: answeredQuestionIds } },
        limit: limitNum,
        offset: (pageNum - 1) * limitNum
    });

    const gameIds = words.map(word => word.gameId);

    if (gameIds.length === 0) {
        return {
            message: "No new GuessTheWord questions available.",
            totalQuestions,
            currentPage: pageNum,
            totalPages: Math.ceil(totalQuestions / limitNum)
        };
    }

    // Fetch ALL translations for these gameIds (all languages at once)
    const allTranslations = await db.GuessTheWordTranslation.findAll({
        where: { gameId: { [Op.in]: gameIds } },
        attributes: ['gameId', 'language', 'translationWord']
    });

    // Fetch associated images
    const images = await db.image.findAll({
        where: { gameId: { [Op.in]: gameIds } },
        attributes: ['gameId', 'image']
    });

    // Map translations by gameId -> { language -> translationWord }
    // Structure: { 101: { English: 'APPLE', Gujarati: 'સફરજન' }, ... }
    const translationsByGameId = allTranslations.reduce((acc, t) => {
        if (!acc[t.gameId]) acc[t.gameId] = {};
        acc[t.gameId][t.language] = t.translationWord;
        return acc;
    }, {});

    // Map images by gameId
    const imagesByGameId = images.reduce((acc, image) => {
        if (!acc[image.gameId]) acc[image.gameId] = [];
        acc[image.gameId].push(image.image);
        return acc;
    }, {});

    // Prepare formatted data with both languages nested
   const formattedData = words.map(wordEntry => {
    const gameTranslations = translationsByGameId[wordEntry.gameId] || {};

    const englishWord = gameTranslations['English'] || wordEntry.word;
    const gujaratiWord = gameTranslations['Gujarati'] || null;

    const englishClean = englishWord.replace(/[^A-Za-z]/g, '').toUpperCase();
    const englishArray = englishClean.split('');

    const gujaratiClean = gujaratiWord ? gujaratiWord.replace(/[^અ-હ઼-ૐ]/g, '') : '';
    const gujaratiArray = gujaratiClean.split('');

    const baseUrl = `${getEnv.DEV_URL}/uploads/`;

    return {
        baseurl: baseUrl,
        gameId: wordEntry.gameId,
        level: wordEntry.level,
        correct_image: wordEntry.correct_Image,
        seconds: wordEntry.time || 15,
        images: imagesByGameId[wordEntry.gameId] || [],
        words: {
            English: {
                word: englishClean,
                jumbledWord: createJumbledWord(englishArray, 'English', 12),
                jumbledWordCount: 12
            },
            Gujarati: gujaratiWord ? {
                word: gujaratiWord,
                jumbledWord: createJumbledWord(
                    gujaratiArray,
                    'Gujarati',
                    12
                ),
                jumbledWordCount: 12
            } : null
        }
    };
});

    // Create activity records
    const activityPromises = formattedData.map(game =>
        db.activity.create({
            gameId: game.gameId,
            game_category: 'Guess_Word',
            userId
        })
    );
    await Promise.all(activityPromises);

    return {
        games: formattedData,
        totalQuestions,
        currentPage: pageNum,
        totalPages: Math.ceil(totalQuestions / limitNum)
    };
});

const deleteGuessWord = asyncHandler(async (query) => {
    const { gameId } = query;

    // Validate that gameId is provided
    if (!gameId) {
        throw new ErrorResponse("Game ID is required", 400);
    }

    const transaction = await db.sequelize.transaction();

    try {
        // Find the existing GuessTheWord entry
        const existingWord = await db.guessthewords.findOne({ 
            where: { gameId }, 
            transaction 
        });

        if (!existingWord) {
            throw new ErrorResponse("Game with this ID does not exist", 404);
        }

        // Fetch all associated translations
        const associatedTranslations = await db.GuessTheWordTranslation.findAll({
            where: { gameId },
            transaction
        });

        // Delete translations
        await db.GuessTheWordTranslation.destroy({
            where: { gameId },
            transaction
        });

        // Fetch all associated images
        const associatedImages = await db.image.findAll({
            where: { gameId },
            transaction
        });

        // Delete image records from the database
        await db.image.destroy({
            where: { gameId },
            transaction
        });

        // Optional: Delete image files from the filesystem
        // Adjust the path to match where your images are stored
        const imageDirectory = path.join(__dirname, '../../uploads/images'); // Example path
        associatedImages.forEach(image => {
            const imagePath = path.join(imageDirectory, image.image);
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error(`Failed to delete image file: ${imagePath}`, err);
                    // Optionally, you can choose to rollback the transaction or handle the error differently
                }
            });
        });

        // Delete the GuessTheWord entry
        await db.guessthewords.destroy({
            where: { gameId },
            transaction
        });

        await transaction.commit();

        return { message: `GuessTheWord with gameId ${gameId} deleted successfully.` };
    } catch (error) {
        await transaction.rollback();
        // If the error is already an instance of ErrorResponse, rethrow it
        if (error instanceof ErrorResponse) {
            throw error;
        }
        throw new ErrorResponse(`Failed to delete GuessTheWord: ${error.message}`, 500);
    }
});

export default {
    deleteGuessWord,
    createGuessWord,
    updateGuessWord,
    fetchGuessWord,
    playGuessWord
};;
