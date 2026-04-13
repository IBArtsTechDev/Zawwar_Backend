import db from "../../config/db.js";
import asyncHandler from "../../middleware/async.js";
import ErrorResponse from "../../utlis/ErrorResponse.js";
import { Op, Sequelize } from "sequelize";
import fs from "fs";
import path from "path";
import xlsx from "xlsx";

const langCodeMap = {
    'en': 'English',
    'guj': 'Gujarati',
    'es': 'Spanish' // Add more languages if needed
};
const translationLanguages = ['Gujarati', 'Spanish'];
// Play Match Function
const playMatch = asyncHandler(async (query) => {
    const { language, userId, page = 1, limit = 30 } = query;

    // Input validation
    if (!userId) throw new ErrorResponse("userId is required", 400);
    if (!language) throw new ErrorResponse("Language is required", 400);

    // Convert language code to full name using langCodeMap
    const fullLanguageName = langCodeMap[language];
    if (!fullLanguageName) {
        throw new ErrorResponse("Unsupported language", 400);
    }

    // Verify user exists
    const existingUser = await db.user.findOne({ where: { userId } });
    if (!existingUser) throw new ErrorResponse("User does not exist", 400);

    // Fetch answered matches
    const answeredMatches = await db.gameAnswer.findAll({
        attributes: ['gameId'],
        where: { userId, isCorrect: true, type: 'match-the-following' }
    });

    const answeredMatchIds = answeredMatches.map(answer => answer.gameId);

    // Build where condition
    const whereCondition = { 
        gameId: { [Op.notIn]: answeredMatchIds.length ? answeredMatchIds : [0] },
    };

        // Fetch matches with pagination
    const matches = await db.match.findAll({
        where: whereCondition,
        attributes: ['gameId', 'level', 'left', 'right', 'question', 'total_plays', 'createdAt', 'updatedAt'],
        limit: parseInt(limit),
        offset: (page - 1) * parseInt(limit),
        order: [['level', 'ASC']]
    });


    console.log(matches,"LLLLLLLLLLLL")

    // Fetch translations for the specified language
    const translations = await db.matchTranslation.findAll({
        where: { gameId: { [Op.in]: matches.map(m => m.gameId) }, language: fullLanguageName },
        attributes: ['gameId', 'language', 'question', 'left', 'right']
    });
    console.log(translations,"SSSSSSSSS")

    // Organize translations by gameId
    const translationsByGameId = translations.reduce((acc, translation) => {
        acc[translation.gameId] = translation;
        return acc;
    }, {});

    // Helper function to safely parse JSON recursively
    const parseJSONRecursively = (data) => {
        try {
            while (typeof data === 'string') {
                data = JSON.parse(data);
            }
        } catch (error) {
            throw new ErrorResponse("Error parsing match data", 500);
        }
        return data;
    };

    // Helper function to shuffle an array while keeping its ID intact
    const shuffleArray = (array) => {
        if (!Array.isArray(array)) {
            throw new Error("Input is not an array");
        }
        return array
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
    };

    // Prepare response
    const response = matches.map(match => {
        const translation = translationsByGameId[match.gameId] || {};
        
        // Parse left and right items with error handling
        let leftItems, rightItems;
        try {
            leftItems = parseJSONRecursively(translation.left || match.left);
            rightItems = parseJSONRecursively(translation.right || match.right);
        } catch (error) {
            throw new ErrorResponse("Error parsing match data", 500);
        }

        // Ensure the parsed items are arrays
        if (!Array.isArray(leftItems) || !Array.isArray(rightItems)) {
            throw new ErrorResponse("Match data is not properly formatted", 400);
        }

        // Assign numeric IDs to both left and right items
        leftItems = leftItems.map((item, index) => ({
            id: index + 1,  // Start numbering from 1
            type: item.type,
            value: item.value
        }));

        rightItems = rightItems.map((item, index) => ({
            id: index + 1,  // Same ID as corresponding left item
            type: item.type,
            value: item.value
        }));

        // Shuffle the left items
        const shuffledLeftItems = shuffleArray(leftItems);

        // Return the match data with shuffled left items and original right items
        return {
            gameId: match.gameId,
            level: match.level,
            question: translation.question || match.question,
            total_plays: match.total_plays,
            leftItems: shuffledLeftItems,
            rightItems: rightItems,
            createdAt: match.createdAt,
            updatedAt: match.updatedAt
        };
    });

    // Optional: Record activity for the first fetched match
    if (response.length > 0) {
        await db.activity.create({
            gameId: response[0].gameId,
            game_category: 'Match',
            userId
        });
    }

    return response;
});

const createMatch = asyncHandler(async (body, files) => {
    console.log("Start of createMatch function");

    // Destructure required fields from body, including 'language'
    const { level, left, right, question, translations, language } = body;
    console.log("Body fields:", { level, left, right, question, translations, language });
    // Validate that the main language is English
    if (!language || language.toLowerCase() !== 'english') {
        throw new ErrorResponse("The main language must be English.", 400);
    }

    // Validate required fields for English
    if (!level || !left || !right || !question) {
        throw new ErrorResponse("Missing required fields: level, left, right, or question for English.", 400);
    }

    // Build a map of files based on their field names
    const filesMap = {};
    files.forEach(file => {
        if (!filesMap[file.fieldname]) {
            filesMap[file.fieldname] = [];
        }
        filesMap[file.fieldname].push(file);
    });
    console.log("Files mapped:", filesMap);

    // Check if a match with the same level and language already exists
    const existingMatch = await db.match.findOne({
        where: { level, language },
    });

    if (existingMatch) {
        throw new ErrorResponse(`A match game with level "${level}" already exists for language "${language}".`, 400);
    }

    let parsedLeft, parsedRight, parsedTranslations;

    // Parse 'left' and 'right' options from JSON
    try {
        parsedLeft = typeof left === 'string' ? JSON.parse(left) : left;
        parsedRight = typeof right === 'string' ? JSON.parse(right) : right;
    } catch (error) {
        throw new ErrorResponse("Invalid JSON format for 'left' or 'right' options.", 400);
    }

    console.log("Parsed left options:", parsedLeft);
    console.log("Parsed right options:", parsedRight);

    // Validate that 'left' and 'right' are arrays and not empty
    if (!Array.isArray(parsedLeft) || parsedLeft.length === 0) {
        throw new ErrorResponse("'left' options should be a non-empty array.", 400);
    }
    if (!Array.isArray(parsedRight) || parsedRight.length === 0) {
        throw new ErrorResponse("'right' options should be a non-empty array.", 400);
    }

    // Parse 'translations' if it's a string
    if (typeof translations === 'string') {
        try {
            parsedTranslations = JSON.parse(translations);
        } catch {
            throw new ErrorResponse("Invalid JSON format for 'translations'.", 400);
        }
    } else {
        parsedTranslations = translations;
    }

    const supportedLanguages = ['English', 'Gujarati', 'Spanish'];

    // Helper function to process options (text/image) with fallback
    const processOptions = (options, side, prefix = '', fallbackOptions = []) => {
        return options.map((option, index) => {
            console.log(`Processing ${side} option at index ${index}:`, option);

            if (option.type === 'text') {
                if (!option.value || !option.value.trim()) {
                    // Fallback to English option if text is missing
                    if (fallbackOptions[index] && fallbackOptions[index].type === 'text') {
                        console.log(`Missing text for ${side} option at index ${index}. Using English text as fallback.`);
                        return fallbackOptions[index];
                    }
                    throw new ErrorResponse(`Missing text for ${side} option at index ${index}.`, 400);
                }
                return option;
            } else if (option.type === 'image') {
                const fieldName = `${prefix}${side}_${index}`;
                console.log(fieldName,"SSSSS",filesMap,"sadasdad")
                const file = filesMap[fieldName] && filesMap[fieldName][0];
                console.log(file,"SSSSssddfdf")
                if (file) {
                    option.value = `${file.filename}`;
                    return option;
                } else {
                    // Fallback to English image if image is missing
                    if (fallbackOptions[index] && fallbackOptions[index].type === 'image') {
                        console.log(`Missing image for ${side} option at index ${index}. Using English image as fallback.`);
                        return fallbackOptions[index];
                    }
                    throw new ErrorResponse(`Missing image file for ${side} option at index ${index}.`, 400);
                }
            } else {
                throw new ErrorResponse(`Invalid type for ${side} option at index ${index}.`, 400);
            }
        });
    };

    // Start a transaction to ensure atomicity
    const transaction = await db.sequelize.transaction();

    try {
        // Process 'left' and 'right' options for English
        const updatedLeftOptions = processOptions(parsedLeft, 'left', '');
        const updatedRightOptions = processOptions(parsedRight, 'right', '');

        // Create the main match entry in the database
        const newMatch = await db.match.create({
            question,
            level,
            left: updatedLeftOptions,
            right: updatedRightOptions,
            language, // English
        }, { transaction });

        // Create a map of translations for easy lookup
        const translationMap = {};
        if (parsedTranslations && Array.isArray(parsedTranslations)) {
            parsedTranslations.forEach(translation => {
                if (translation.language && supportedLanguages.includes(translation.language)) {
                    translationMap[translation.language.toLowerCase()] = translation;
                }
            });
        }

        for (let i = 0; i < translationLanguages.length; i++) {
            const lang = translationLanguages[i];
            if (lang.toLowerCase() === 'english') continue; // Skip English as it's already created

            let translation = translationMap[lang.toLowerCase()];
            console.log(translation, "FFFFF", translationMap, "GGGG");

            // Check if translation contains any images, and decide action accordingly
            const containsImage = translation && (
                (translation.left && translation.left.some(option => option.type === 'image')) ||
                (translation.right && translation.right.some(option => option.type === 'image'))
            );

            if (!translation) {
                // If translation is missing or does not contain images, use English data entirely
                translation = {
                    language: lang,
                    question: question, // Use English question
                    left: parsedLeft,
                    right: parsedRight,
                };
                console.log(translation, "trttrt");
                console.log(`No valid translation provided for ${lang} or translation does not contain images. Using English data as default.`);
            } else {
                console.log(`Using provided translation for ${lang}:`, translation);

                const { question: translationQuestion, left: translationLeft, right: translationRight } = translation;

                // Fill in missing question with English question
                if (!translationQuestion || !translationQuestion.trim()) {
                    translation.question = question;
                    console.log(`No question provided for ${lang}. Using English question as default.`);
                }

                // Fill in missing left options with English left options
                if (!Array.isArray(translationLeft) || translationLeft.length === 0) {
                    translation.left = parsedLeft;
                    console.log(`No left options provided for ${lang}. Using English left options as default.`);
                } else {
                    // Process individual left options, fallback to English for missing entries
                    translation.left = translationLeft.map((option, index) => {
                        if ((option.type === 'text' && (!option.value || !option.value.trim())) || 
                            (option.type === 'image' && (!option.value || !option.value.trim()))) {
                            // Use English value for missing text/image
                            if (parsedLeft[index]) {
                                console.log(`Missing data for ${lang} left option at index ${index}. Using English data as fallback.`);
                                return parsedLeft[index];
                            }
                            throw new ErrorResponse(`Missing data for ${lang} left option at index ${index}.`, 400);
                        }
                        return option;
                    });
                }

                // Fill in missing right options with English right options
                if (!Array.isArray(translationRight) || translationRight.length === 0) {
                    translation.right = parsedRight;
                    console.log(`No right options provided for ${lang}. Using English right options as default.`);
                } else {
                    // Process individual right options, fallback to English for missing entries
                    translation.right = translationRight.map((option, index) => {
                        if ((option.type === 'text' && (!option.value || !option.value.trim())) || 
                            (option.type === 'image' && (!option.value || !option.value.trim()))) {
                            // Use English value for missing text/image
                            if (parsedRight[index]) {
                                console.log(`Missing data for ${lang} right option at index ${index}. Using English data as fallback.`);
                                return parsedRight[index];
                            }
                            throw new ErrorResponse(`Missing data for ${lang} right option at index ${index}.`, 400);
                        }
                        return option;
                    });
                }
            }

            // Define prefix using index instead of language name
            const prefix = `translation_${i}_`; // e.g., translation_1_, translation_2_, etc.

            // Process options for the translation, including English fallback if necessary
            const updatedTranslationLeft = processOptions(
                translation.left,
                'left',
                prefix,
                parsedLeft
            );
            const updatedTranslationRight = processOptions(
                translation.right,
                'right',
                prefix,
                parsedRight
            );

            // Prepare translation entry
            const translationEntry = {
                gameId: newMatch.gameId,
                language: translation.language,
                question: translation.question,
                left: updatedTranslationLeft,
                right: updatedTranslationRight,
            };

            // Create the translation entry in the database
            await db.matchTranslation.create(translationEntry, { transaction });
            console.log(`Translation for ${lang} created successfully.`);
        }
        // Commit the transaction
        await transaction.commit();
        console.log("Match and translations created successfully:", newMatch);


       return ({
            success: true,
        });
    } catch (error) {
        // Rollback the transaction in case of errors
        await transaction.rollback();
        console.error("Error creating match:", error);// Pass the error to your error handling middleware
    }
});



const updateMatch = asyncHandler(async (params, body, files) => {
    console.log("Function called for updating match");

    const { gameId } = params;
    const { level, left, right, language, question, translations } = body;
    console.log("Update Match Body:", body);
    console.log("Files:", files);

    // Find the existing match
    const match = await db.match.findByPk(gameId);
    if (!match) {
        throw new ErrorResponse(`Match not found with ID: ${gameId}`, 404);
    }

    // Parse left and right options if they are JSON strings
    let leftOptions, rightOptions;
    try {
        leftOptions = typeof left === 'string' ? JSON.parse(left) : left;
        rightOptions = typeof right === 'string' ? JSON.parse(right) : right;
    } catch (parseError) {
        throw new ErrorResponse("Invalid JSON format for left or right options", 400);
    }

    // Ensure left and right options are arrays
    if (!Array.isArray(leftOptions) || !Array.isArray(rightOptions)) {
        throw new ErrorResponse("Left and Right options should be arrays", 400);
    }

    // Organize files for quick access by field name
    const fileMap = {};
    files.forEach(file => {
        fileMap[file.fieldname] = file;
    });

    const deleteFileAsync = (filePath) => new Promise((resolve, reject) => {
        fs.unlink(filePath, err => {
            if (err) reject(err);
            else resolve();
        });
    });

    const validateAndProcessOptions = async (options, side, prefix = '') => {
        const existingOptions = JSON.parse(match[side] || '[]');
        
        // Debugging: Log the entire fileMap at the start to confirm field names
        console.log("Full fileMap:", fileMap);
    
        return Promise.all(options.map(async (option, index) => {
            const fieldName = `${prefix}${side}_${index}`;
            console.log(`Processing ${fieldName} for ${side}`);
            
            if (option.type === 'text') {
                if (!option.value || !option.value.trim()) {
                    throw new ErrorResponse(`Missing text for ${side} option at index ${index}`, 400);
                }
                return option;
            } else if (option.type === 'image') {
                const file = fileMap[fieldName];
                const existingOption = existingOptions[index];
    
                // Debugging: Log to see what we are getting for each fieldName
                console.log(`Field Name: ${fieldName}, File from fileMap:`, file);
    
                if (file) {
                    // If the file exists, use its filename
                    option.value = file.filename;
                    return option;
                } else if (existingOption && existingOption.value) {
                    // Retain existing image if no new file is uploaded
                    option.value = existingOption.value;
                    return option;
                } else {
                    // Throw error if neither new file nor existing option is found
                    throw new ErrorResponse(`Missing image for ${side} option at index ${index}`, 400);
                }
            } else {
                throw new ErrorResponse(`Invalid type for ${side} option at index ${index}`, 400);
            }
        }));
    };
    

    // Prepare updated fields with existing or new values
    const updatedFields = {
        level: level || match.level,
        language: language || match.language,
        question: question !== undefined ? question : match.question,
    };

    console.log("Updated Fields before conditional additions:", updatedFields);

    // Process left and right options if provided
    if (left) {
        const validatedLeftOptions = await validateAndProcessOptions(leftOptions, 'left');
        updatedFields.left = validatedLeftOptions;

    }
    if (right) {
        const validatedRightOptions = await validateAndProcessOptions(rightOptions, 'right');
        updatedFields.right = validatedRightOptions;
    }

    console.log("Final Updated Fields before update:", updatedFields);

    // Update the match record in the database
    await match.update(updatedFields);
 // Handle translations if provided
    let parsedTranslations = [];
    if (translations) {
        try {
            parsedTranslations = typeof translations === 'string' ? JSON.parse(translations) : translations;
        } catch (error) {
            throw new ErrorResponse("Invalid JSON format for translations", 400);
        }

     const supportedLanguages = ['English', 'Gujarati', 'Spanish'];

     const validateAndProcessTranslationOptions = async (options, side, prefix = '', existingOptions) => {
         return Promise.all(options.map(async (option, index) => {
             const fieldName = `${prefix}${side}_${index}`;
             console.log(`Processing ${fieldName} for ${side} in translation`);
             const file = fileMap[fieldName];
             const existingOption = existingOptions[index];

             if (option.type === 'text') {
                 if (!option.value || !option.value.trim()) {
                     throw new ErrorResponse(`Missing text for ${side} option at index ${index} in translation`, 400);
                 }
                 return option;
             } else if (option.type === 'image') {
                 if (file) {
                     option.value = file.filename;
                     return option;
                 } else if (existingOption && existingOption.value) {
                     option.value = existingOption.value;
                     return option;
                 } else {
                     throw new ErrorResponse(`Missing image for ${side} option at index ${index} in translation`, 400);
                 }
             } else {
                 throw new ErrorResponse(`Invalid type for ${side} option at index ${index} in translation`, 400);
             }
         }));
     };

     for (let tIdx = 0; tIdx < parsedTranslations.length; tIdx++) {
         const translation = parsedTranslations[tIdx];
         const {
             language: translationLang,
             question: translationQuestion,
             left: translationLeft,
             right: translationRight
         } = translation;

         if (!supportedLanguages.includes(translationLang)) {
             throw new ErrorResponse(`Unsupported translation language: ${translationLang}`, 400);
         }

         let parsedTranslationLeft, parsedTranslationRight;
         try {
             parsedTranslationLeft = typeof translationLeft === 'string' ? JSON.parse(translationLeft) : translationLeft;
             parsedTranslationRight = typeof translationRight === 'string' ? JSON.parse(translationRight) : translationRight;
         } catch (parseError) {
             throw new ErrorResponse("Invalid JSON format for translation left or right options", 400);
         }

         if (!Array.isArray(parsedTranslationLeft) || !Array.isArray(parsedTranslationRight)) {
             throw new ErrorResponse("Translation left and right options should be arrays", 400);
         }

         const existingTranslation = await db.matchTranslation.findOne({
             where: { gameId, language: translationLang }
         });

         const existingOptionsLeft = existingTranslation ? JSON.parse(existingTranslation.left || '[]') : [];
         const existingOptionsRight = existingTranslation ? JSON.parse(existingTranslation.right || '[]') : [];

         const prefix = `translation_${tIdx}_`;

         const validatedLeftOptions = await validateAndProcessTranslationOptions(
             parsedTranslationLeft,
             'left',
             prefix,
             existingOptionsLeft
         );
         const validatedRightOptions = await validateAndProcessTranslationOptions(
             parsedTranslationRight,
             'right',
             prefix,
             existingOptionsRight
         );

         if (existingTranslation) {
             await existingTranslation.update({
                 question: translationQuestion,
                 left: validatedLeftOptions,
                 right: validatedRightOptions
             });
         } else {
             await db.matchTranslation.create({
                 gameId,
                 language: translationLang,
                 question: translationQuestion,
                 left: validatedLeftOptions,
                 right: validatedRightOptions
             });
         }
     }
 }
    const updatedMatch = await db.match.findByPk(gameId);
    const updatedTranslations = await db.matchTranslation.findAll({ where: { gameId } });

    const result = {
        ...updatedMatch.toJSON(),
        translations: updatedTranslations.map(translation => translation.toJSON())
    };

    console.log("Update result:", result);

    return result;
});

const getAllMatches = asyncHandler(async (filters = {}) => {
try {
    // Fetch all matches based on filters
    const matches = await db.match.findAll({ where: filters });

    if (!matches || matches.length === 0) {
    console.log('No matches found with the given filters.');
    return [];
    }

    const matchIds = matches.map(match => match.gameId);
    console.log(matchIds,"SSSSS")
    // Fetch all translations for these matches
    const translations = await db.matchTranslation.findAll({
    where: { gameId: { [Op.in]: matchIds } }
    });

    // Group translations by gameId
    const translationsByGameId = translations.reduce((acc, translation) => {
    if (!acc[translation.gameId]) acc[translation.gameId] = [];
    acc[translation.gameId].push({
        language: translation.language,
        question: translation.question,
        left: translation.left,
        right: translation.right
    });
    return acc;
    }, {});

    /* console.log('Translations grouped by gameId:', translationsByGameId); */

    // Map translations to matches
    console.log(matches,"SSSSSSSSSSSS")
    const result = matches.map(match => {
    const matchJSON = match.toJSON ? match.toJSON() : { ...match }; // Fallback if toJSON is not defined
    return {
        ...matchJSON,
         total_play: matchJSON.total_plays,
        translations: translationsByGameId[match.gameId] || []
    };
    });

    return result;
} catch (error) {
    console.error('Error in getAllMatches:', error);
    throw error; // Let asyncHandler handle the error
}
});
// Delete Match Function
const deleteMatch = asyncHandler(async (params) => {
    const { gameId } = params;
    const match = await db.match.findByPk(gameId);

    if (!match) throw new ErrorResponse(`Match not found with ID: ${gameId}`, 404);

    // Delete the match and its translations
    await db.matchTranslation.destroy({ where: { gameId } });
    await match.destroy();

    return { success: true, message: "Match and translations deleted successfully" };
});

const uploadMatchesFromExcel = asyncHandler(async (file) => {
    if (!file || file.fieldname !== 'files') {
        throw new ErrorResponse("No Excel file uploaded or incorrect field name", 400);
    }

    try {
        const workbook = xlsx.readFile(file.path);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = xlsx.utils.sheet_to_json(worksheet);

        const matchesToCreate = [];
        const translationsToCreate = [];
        const supportedLanguages = ['English', 'Gujarati', 'Spanish'];

        jsonData.forEach((row, index) => {
            const { level, question, left, right, gujarati_question, gujarati_left, gujarati_right, spanish_question, spanish_left, spanish_right } = row;

            if (!level || !left || !right) throw new ErrorResponse(`Missing required fields in row ${index + 2}`, 400);

            const matchData = {
                level,
                question: question || "",
                left: JSON.parse(left),
                right: JSON.parse(right),
            };
            matchesToCreate.push(matchData);

            const translations = [
                { language: 'Gujarati', question: gujarati_question, left: JSON.parse(gujarati_left), right: JSON.parse(gujarati_right) },
                { language: 'Spanish', question: spanish_question, left: JSON.parse(spanish_left), right: JSON.parse(spanish_right) }
            ];

            translations.forEach((translation, tIdx) => {
                if (!supportedLanguages.includes(translation.language)) return;

                translationsToCreate.push({
                    matchIndex: matchesToCreate.length - 1,
                    translation: {
                        language: translation.language,
                        question: translation.question || "",
                        left: translation.left,
                        right: translation.right
                    },
                    translationOrder: tIdx
                });
            });
        });

        const transaction = await db.sequelize.transaction();
        try {
            const createdMatches = await db.match.bulkCreate(matchesToCreate, { returning: true, transaction });

            const translationsData = translationsToCreate.map((item) => ({
                gameId: createdMatches[item.matchIndex].gameId,
                language: item.translation.language,
                question: item.translation.question,
                left: item.translation.left,
                right: item.translation.right
            }));

            if (translationsData.length) await db.matchTranslation.bulkCreate(translationsData, { transaction });

            await transaction.commit();
            fs.unlinkSync(file.path);
            return { success: true, message: "Matches and translations uploaded successfully", data: createdMatches };

        } catch (dbError) {
            await transaction.rollback();
            throw dbError;
        }
    } catch (error) {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        throw error;
    }
});


export default {
    playMatch,
    createMatch,
    updateMatch,
    getAllMatches,
    deleteMatch,
    uploadMatchesFromExcel
};;
