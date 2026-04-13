import db from "../../config/db.js";
import asyncHandler from "../../middleware/async.js";
import ErrorResponse from "../../utlis/ErrorResponse.js";
import { Op, Sequelize, json } from "sequelize";
import xlsx from "xlsx";

const createQUiz = asyncHandler(async (body, files) => {
    
    const quizNames = body.quizName.split(',');
    const languages = body.language.split(',');

    const acceptedLanguage = ['en','gu'];
    languages.forEach((lang) => {
        if(!acceptedLanguage.includes(lang)){
            throw new ErrorResponse(`Language ${lang} not supported`,422);
        };
    });
    console.log(files)
    console.log(body);
    console.log(quizNames);
    console.log(quizNames.length);
    console.log(languages.length);
    const existingQuiz = await db.quiz.findOne({ where: { quizName: quizNames[0] } });
    if (existingQuiz) {
        throw new ErrorResponse('Quiz with the same name already exists', 400);
    }

const checkGujrati = body.isGujrati === '0'
    ? (languages.includes('gu') ? 1 : 0)
    : 0;

    const quizData = {
        quizName: quizNames[0],
        isGujrati: checkGujrati,
        language: languages[0],
        quizImage: files[0] ? files[0].filename : null

    };
    console.log(quizData);
    const transaction = await db.sequelize.transaction();
    try {
        const quiz = await db.quiz.create(quizData, { transaction });
        console.log(quiz);
        const translations = languages.map((lang, index) => ({
            quizId: quiz.quizId,
            language: lang,
            quizName: quizNames[index],
            quizImage: files[index] ? files[index].filename : null, 
        })).slice(1); 
        console.log(translations);
        await db.quizTrans.bulkCreate(translations, { transaction });
        await transaction.commit();
        return quiz; 
    } catch (error) {
        console.error('Error details:', error);
        await transaction.rollback();
        throw new ErrorResponse(`Failed to create quiz and translations: ${error.message}`, 500);
    }
});

const fetchadminQuizzes = asyncHandler(async () => {
    const quizzes = await db.quiz.findAll({
        attributes: ['quizId', 'quizName', 'isGujrati', 'quizImage', 'language', 'totalPlays'],
    });
    const translations = await db.quizTrans.findAll({
        attributes: ['quizId', 'language', 'quizName'],
    });
    const translationsMap = translations.reduce((acc, translation) => {
        if (!acc[translation.quizId]) {
            acc[translation.quizId] = [];
        }
        acc[translation.quizId].push(translation);
        return acc;
    }, {});
    const quizzesWithTranslations = await Promise.all(quizzes.map(async (quiz) => {
        const questionCount = await db.question.count({ where: { quizId: quiz.quizId } });
        return {
            ...quiz.toJSON(),
            numberOfQuestions: questionCount,
            translations: translationsMap[quiz.quizId] || [],
        };
    }));

    return quizzesWithTranslations;
});

const updateQuiz = asyncHandler(async (query, body, file) => {
    const { quizId } = query;
    const quizName = body.quizName.split(',');
    const language = body.language.split(',');
    if (!quizId) {
        throw new ErrorResponse('Quiz ID is required', 400);
    }
    if (!Array.isArray(quizName) || !Array.isArray(language) || quizName.length !== language.length) {
        throw new ErrorResponse('quizName and language must be of the same length', 400);
    }
    const quiz = await db.quiz.findOne({ where: { quizId } });
    if (!quiz) {
        throw new ErrorResponse('Quiz does not exist', 404);
    }

    if (!["0", "1"].includes(body.isGujrati)) {
        throw new ErrorResponse("Invalid Value of isGujrati it must be 0 or 1", 422)
    }


    const transaction = await db.sequelize.transaction();
    let updatedQuizData = {};
    language.forEach(async (lang) => {

        if(lang === 'en'){
             updatedQuizData = {
                quizName: quizName[0] || quiz.quizName,
                isGujrati: body.isGujrati? body.isGujrati : quiz.isGujrati,
                quizImage: file ? file.filename : quiz.quizImage,
                language: language[0] || quiz.language,
            };

        }
        await quiz.update(updatedQuizData, { transaction });
    })


    try {

        const existingTranslations = await db.quizTrans.findAll({
            where: { quizId },
            transaction,
        });

        if(body.isGujrati === '0' || body.isGujrati === 0){
            await db.quizTrans.destroy({
                where: { quizId },
                transaction
            });
            await transaction.commit();
            return quiz;
        }

        const translationUpdates = language.map(async (lang, index) => {

            if(lang === 'gu'){
                if(quiz.isGujrati = '0'){
                   await quiz.update({
                        isGujrati:"1"
                    })
                }
                const existingTranslation = existingTranslations.find(trans => trans.language === lang);
                if (existingTranslation) {
                    return existingTranslation.update({
                        quizName: quizName[index],
                        quizImage: updatedQuizData.quizImage || quiz.quizImage,
                    }, { transaction });
                } else {
                    return db.quizTrans.create({
                        quizId,
                        language: lang,
                        quizName: quizName[index],
                        quizImage: updatedQuizData.quizImage || quiz.quizImage,
                    }, { transaction });
                }
            }
        });
        await Promise.all(translationUpdates);

        await transaction.commit();
        return quiz;
    } catch (error) {
        console.error('Error details:', error);
        await transaction.rollback();
        throw new ErrorResponse(`Failed to update quiz and translations: ${error.message}`, 500);
    }
});

const deleteQuiz = asyncHandler(async (query) => {
    console.log(query);
    const { id } = query;
    const quiz = await db.quiz.findOne({ where: { quizId: id } });
    if (!quiz) {
        throw new ErrorResponse('Quiz does not exist', 404);
    }
    await db.quizTrans.destroy({ where: { quizId: id } });
    await db.question.destroy({ where: { quizId: id } });
    await quiz.destroy();
    return [];
});


const fetchQuizzes = asyncHandler(async () => {

    // 1. Fetch all quizzes
    const quizzes = await db.quiz.findAll({
        attributes: ['quizId', 'quizName', 'quizImage', 'totalPlays', 'isGujrati'],
        raw: true,
    });

    const quizIds = quizzes.map(q => q.quizId);

    // 2. Fetch all Gujarati translations in one query
    const translations = await db.quizTrans.findAll({
        where: {
            quizId: { [Sequelize.Op.in]: quizIds },
            language: 'gu',
        },
        attributes: ['quizId', 'quizName'],
        raw: true,
    });

    // 3. Fetch question counts per quiz in one query
    const questionCounts = await db.question.findAll({
        where: {
            quizId: { [Sequelize.Op.in]: quizIds },
        },
        attributes: [
            'quizId',
            [Sequelize.fn('COUNT', Sequelize.col('questionId')), 'noOfQuestions'],
        ],
        group: ['quizId'],
        raw: true,
    });

    // 4. Build lookup maps for O(1) access
    const translationMap = translations.reduce((acc, t) => {
        acc[t.quizId] = t;
        return acc;
    }, {});

    const questionCountMap = questionCounts.reduce((acc, q) => {
        acc[q.quizId] = parseInt(q.noOfQuestions, 10);
        return acc;
    }, {});

    // 5. Shape the final response
    const availableQuizzes = quizzes.map((quiz) => {
        const gujarati = translationMap[quiz.quizId];
        const noOfQuestions = questionCountMap[quiz.quizId] || 0;

        // Shared fields that don't change between languages
        const shared = {
            quizId:     quiz.quizId,
            quizImage:  quiz.quizImage,
            totalPlays: quiz.totalPlays,
            isGujrati:  quiz.isGujrati,
            noOfQuestions,
        };

        return {
            ...shared,
            en: {
            
                quizName: quiz.quizName,
            },
            gu: {
          
                quizName: gujarati?.quizName || null,
            },
        };
    });

    return availableQuizzes;
});

const fetchuserquiz = asyncHandler(async () => {
    console.log("request come");
    
    // 1. Fetch all quizzes
    const quizzes = await db.quiz.findAll({
        attributes: ['quizId', 'quizName', 'quizImage', 'totalPlays', 'isGujrati'],
        raw: true,
    });
    const quizIds = quizzes.map(q => q.quizId);

    // 2. Fetch Gujarati quiz translations
    const translations = await db.quizTrans.findAll({
        where: {
            quizId: { [Sequelize.Op.in]: quizIds },
            language: 'gu',
        },
        attributes: ['quizId', 'quizName'],
        raw: true,
    });
    const translationMap = translations.reduce((acc, t) => {
        acc[t.quizId] = t;
        return acc;
    }, {});

    // 3. Fetch 10 random eng questions + gu translations per quiz
    const engQuestionsMap = {};
    const guQuestionsMap = {};

    for (const quizId of quizIds) {
        // Fetch 10 random english questions for this quiz
        const engQuestions = await db.question.findAll({
            where: { quizId },
            attributes: ['questionId', 'quizId', 'question', 'options', 'correct_Answer', 'time', 'type'],
            order: [Sequelize.literal('RAND()')],
            limit: 10,
            raw: true,
        });

        engQuestionsMap[quizId] = engQuestions.map(q => ({
            ...q,
            options: typeof q.options === "string" ? JSON.parse(q.options) : q.options
        }));

        // Fetch gu translations for those 10 questions
        const questionIds = engQuestions.map(q => q.questionId);
        if (questionIds.length > 0) {
            const guQuestions = await db.QuestionTranslation.findAll({
                where: {
                    questionId: { [Sequelize.Op.in]: questionIds }
                },
                attributes: ['questionId', , 'question', 'options', 'correct_Answer', 'time', 'type'],
                raw: true,
            });

            guQuestionsMap[quizId] = guQuestions.map(q => ({
                ...q,
                options: typeof q.options === "string" ? JSON.parse(q.options) : q.options
            }));
        } else {
            guQuestionsMap[quizId] = [];
        }
    }

    // 4. Shape the final response
    const availableQuizzes = quizzes.map((quiz) => {
        const gujarati = translationMap[quiz.quizId];
        return {
            quizId:     quiz.quizId,
            quizImage:  quiz.quizImage,
            totalPlays: quiz.totalPlays,
            isGujrati:  quiz.isGujrati,
            en: {
                quizName:  quiz.quizName,
                questions: engQuestionsMap[quiz.quizId] || []
            },
            gu: {
                quizName:  gujarati?.quizName || null,
                questions: guQuestionsMap[quiz.quizId] || []
            },
        };
    });

    return availableQuizzes;
});;

const fetchadminquestions = asyncHandler(async (query) => {
    const { quizId } = query; 

    if (!quizId) {
        throw new ErrorResponse('Quiz ID is required', 400);
    }

    // Fetch questions based on quizId
    const questions = await db.question.findAll({
        where: { quizId }, 
        attributes: [
            'questionId', 
            'quizId', 
            'question', 
            'options', 
            'correct_Answer', 
            'time', 
            'questionImage', 
            'ageLimit', 
            'type', 
            'language'
        ],
    });

    // Fetch translations for the questions
    const translations = await db.QuestionTranslation.findAll({
        where: { questionId: questions.map(q => q.questionId) }, 
        attributes: ['questionId', 'language', 'questions', 'options', 'correct_Answer'],
    });

    // Create a mapping of translations by questionId
    const translationsMap = translations.reduce((acc, translation) => {
        if (!acc[translation.questionId]) {
            acc[translation.questionId] = [];
        }
        acc[translation.questionId].push(translation.toJSON()); // Convert to plain object here
        return acc;
    }, {});
    // Map questions to include parsed options and translations
    const questionsWithTranslations = questions.map(question => {
        const parsedOptions = JSON.parse(question.options); 
        const translationsWithParsedOptions = translationsMap[question.questionId]?.map(translation => ({
            ...translation,
            options: JSON.parse(translation.options), // Parse options from JSON
        })) || []; 

        return {
            ...question.toJSON(), // Convert question to plain object
            options: parsedOptions, 
            translations: translationsWithParsedOptions, 
        };
    });

    return questionsWithTranslations; // Return the formatted data
});

const createQuestion = asyncHandler(async (body, file) => {
    const { quizId } = body;
    const questions = JSON.parse(body.questions)
    console.log(questions)
    console.log(body, file);
    console.log(file?.filename);

    const existingQuiz = await db.quiz.findOne({ where: { quizId } });
    if (!existingQuiz) {
        throw new ErrorResponse("Quiz does not exist", 404);
    }

    const createdQuestions = [];

    for (const questionData of questions) {
        const { question, options, correct_Answer, time, type, language, translations } = questionData;
        console.log(questionData)
        if (!Array.isArray(options) || options.length < 2) {
            throw new ErrorResponse("At least two options are required", 400);
        }
        if (!options.includes(correct_Answer)) {
            throw new ErrorResponse("Correct answer must be one of the provided options", 400);
        }
        const optionsObj = options.reduce((acc, option, index) => {
            acc[`Option${index + 1}`] = option;
            return acc;
        }, {});

        const questionEntry = {
            quizId,
            question,
            options: optionsObj,
            correct_Answer,
            time,
            type,
            ageLimit:"all",
            language,
            questionImage: file ? file.filename : null
        };
        console.log(questionEntry, "question data")
        const newQuestion = await db.question.create(questionEntry);
        createdQuestions.push(newQuestion);
        if (translations && translations.length > 0) {
            for (const translation of translations) {
                const { language, question: transQuestion, options: transOptions, correct_Answer: transCorrectAnswer } = translation;

                const translationData = {
                    questionId: newQuestion.questionId,
                    language,
                    questions: transQuestion,
                    options: transOptions.reduce((acc, option, index) => {
                        acc[`Option${index + 1}`] = option;
                        return acc;
                    }, {}),
                    correct_Answer: transCorrectAnswer
                };

                await db.QuestionTranslation.create(translationData);
            }
        }
    }

    return createdQuestions;
});

const createQuestionFromExcel = asyncHandler(async (file, body) => {
    // 1. Log the body to verify contents
    console.log('Request Body:', body);

    // 2. Extract quizId with correct casing
    const { quizId } = body;

    // 3. Validate presence of quizId
    if (!quizId) {
        throw new ErrorResponse("quizId is required in the request body", 400);
    }

    // 4. Read and parse the Excel file
    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const rawSheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    console.log('Raw Sheet Data:', rawSheetData);

    // 5. Normalize headers to lowercase and trim spaces
    const normalizeHeaders = (sheetData) => {
        return sheetData.map(row => {
            const normalizedRow = {};
            for (const key in row) {
                const normalizedKey = key.trim().toLowerCase();
                normalizedRow[normalizedKey] = row[key];
            }
            return normalizedRow;
        });
    };

    const sheetData = normalizeHeaders(rawSheetData);
    console.log('Normalized Sheet Data:', sheetData);

    // 6. Find the existing quiz
    const existingQuiz = await db.quiz.findOne({ where: { quizId } });

    if (!existingQuiz) {
        throw new ErrorResponse("Quiz does not exist", 404);
    }

    const createdQuestions = [];
    const problematicQuestions = [];

    // Helper function to safely convert and trim strings
    const sanitizeString = (value) => String(value || '').trim();

    // Helper function to parse options with flexible delimiters
    const parseOptions = (options, type, language) => {
        if (type.toLowerCase() === 'boolean') {
            return language.toLowerCase() === 'gujarati' ? ['સાચું', 'ખોટું'] : ['true', 'false'];
        }

        // Define possible delimiters
        const delimiters = [',', ';', '|', '\n'];
        let parsedOptions = [];

        // Attempt to split using each delimiter until successful
        for (const delimiter of delimiters) {
            parsedOptions = options.split(delimiter).map(option => option.trim().toLowerCase()).filter(opt => opt);
            if (parsedOptions.length >= 2) break;
        }

        // Remove any surrounding quotes
        parsedOptions = parsedOptions.map(option => option.replace(/^['"]|['"]$/g, ''));

        return parsedOptions;
    };

    // Iterate over each row in the Excel sheet
    for (const [index, row] of sheetData.entries()) {
        try {
            // Destructure and sanitize row data
            let {
                question,
                options,
                correct_answer, // Assuming 'correct_Answer' is normalized to 'correct_answer'
                time,
                type,
                agelimit, // Assuming 'ageLimit' is normalized to 'agelimit'
                language
            } = row;

            question = sanitizeString(question);
            options = sanitizeString(options);
            correct_answer = sanitizeString(correct_answer);
            time = sanitizeString(time);
            type = sanitizeString(type).toLowerCase();
            agelimit = sanitizeString(agelimit);
            language = sanitizeString(language).toLowerCase();

            // Detailed logging
            console.log(`Row ${index + 2} - Sanitized Data:`, {
                question,
                options,
                correct_answer,
                time,
                type,
                agelimit,
                language
            });

            // Validate mandatory fields
            if (!question) {
                throw new Error("Question text is missing.");
            }
            if (!type) {
                throw new Error("Question type is missing.");
            }
            if (!language) {
                throw new Error("Language is missing.");
            }

            // Validate and correct 'type' field
            if (!['boolean', 'options'].includes(type)) {
                console.warn(`Row ${index + 2}: Unrecognized type "${type}". Defaulting to "multiple".`);
                type = 'options';
            }

            // Parse options based on question type and language
            let parsedOptions = parseOptions(options, type, language);
            let sanitizedCorrectAnswer = correct_answer.toLowerCase();

            // Handle cases where options might be missing or improperly formatted
            if (parsedOptions.length < 2 && type !== 'boolean') {
                // Attempt to infer options from the correct answer if possible
                if (sanitizedCorrectAnswer) {
                    parsedOptions = [sanitizedCorrectAnswer];
                    console.warn(`Row ${index + 2}: Only one option found. Attempting to add a default second option.`);
                    // Add a default incorrect option based on the language
                    if (language === 'gujarati') {
                        parsedOptions.push('અજણ્યું'); // Means 'Unknown' in Gujarati
                    } else {
                        parsedOptions.push('unknown');
                    }
                } else {
                    throw new Error("At least two options are required, and correct answer is missing.");
                }
            }

            // Validate correct answer presence in options
            if (type !== 'boolean' && !parsedOptions.includes(sanitizedCorrectAnswer)) {
                sanitizedCorrectAnswer = parsedOptions[0];
                console.log(`Row ${index + 2}: Correct answer not found in options. Automatically setting correct answer to: "${sanitizedCorrectAnswer}"`);
            }

            // Construct options object
            const optionsObj = parsedOptions.reduce((acc, option, idx) => {
                acc[`Option${idx + 1}`] = option;
                return acc;
            }, {});

            // Prepare question data
            const questionData = {
                quizId: quizId, // Ensure this matches your database field
                question,
                options: optionsObj,
                correct_Answer: sanitizedCorrectAnswer,
                time,
                type,
                ageLimit: agelimit,
                language,
                questionImage: null // Modify this if you're uploading images later
            };

            // Create the question in the database
            const newQuestion = await db.question.create(questionData);
            console.log(`Row ${index + 2}: Created Question ID ${newQuestion.questionId}`);
            createdQuestions.push(newQuestion);

            // Handle translations
            const translations = [];
            const translationKeys = Object.keys(row).filter(key => key.startsWith('translation'));

            // Assuming each translation has a set of 4 fields: language, question, options, correct_answer
            const translationCount = Math.floor(translationKeys.length / 4);

            for (let i = 1; i <= translationCount; i++) {
                const lang = sanitizeString(row[`translation${i}_language`]);
                const transQuestion = sanitizeString(row[`translation${i}_question`]);
                const transOptions = sanitizeString(row[`translation${i}_options`]);
                const transCorrectAnswer = sanitizeString(row[`translation${i}_correct_answer`]);

                if (lang && transQuestion && transOptions && transCorrectAnswer) {
                    const transOptionsArray = parseOptions(transOptions, type, lang);

                    // Validate translation options
                    if (transOptionsArray.length < 2 && type !== 'boolean') {
                        console.warn(`Row ${index + 2}, Translation ${i}: Not enough options. Skipping this translation.`);
                        continue;
                    }

                    let sanitizedTransCorrectAnswer = transCorrectAnswer.toLowerCase();
                    if (type !== 'boolean' && !transOptionsArray.includes(sanitizedTransCorrectAnswer)) {
                        sanitizedTransCorrectAnswer = transOptionsArray[0];
                        console.log(`Row ${index + 2}, Translation ${i}: Correct answer not found in options. Automatically setting correct answer to: "${sanitizedTransCorrectAnswer}"`);
                    }

                    const translationData = {
                        questionId: newQuestion.questionId,
                        language: lang,
                        questions: transQuestion,
                        options: transOptionsArray.reduce((acc, option, idx) => {
                            acc[`Option${idx + 1}`] = option;
                            return acc;
                        }, {}),
                        correct_Answer: sanitizedTransCorrectAnswer
                    };

                    translations.push(translationData);
                }
            }

            if (translations.length > 0) {
                await db.QuestionTranslation.bulkCreate(translations);
                console.log(`Row ${index + 2}: Added ${translations.length} translations for Question ID ${newQuestion.questionId}`);
            }

        } catch (error) {
            console.error(`Row ${index + 2} - Error processing question: "${row.question}"`, error.message);
            problematicQuestions.push({ question: row.question, error: error.message });
        }
    }
    
    // Optional: Delete the processed file to save space
    try {
        await fs.unlink(file.path);
        console.log(`Deleted file: ${file.path}`);
    } catch (unlinkError) {
        console.error(`Error deleting file: ${file.path}`, unlinkError.message);
    }

    return {
        createdQuestions,
        problematicQuestions,
        totalQuestions: sheetData.length,
        successRate: ((createdQuestions.length / sheetData.length) * 100).toFixed(2) + '%',
    };
});

const updateQuestion = asyncHandler(async (query, body, file) => {
    const { questionId } = query;
    console.log(file);
    console.log(body);
 
  
    const question = await db.question.findOne({ where: { questionId } });
    if (!question) {
      throw new ErrorResponse("Question does not exist", 404);
    }
  
    // Assuming body.questions is an array of question objects, each with languageEntries
    const questions = JSON.parse(body.questions); 
    
  
    // Start a transaction
    const transaction = await db.sequelize.transaction();
  
    try {
      for (const questionData of questions) {
        const { language, question: q, options, correct_Answer, time, type, ageLimit } = questionData;
  
        if (language === 'English') {
          // Update the main question
          if (!Array.isArray(options) || options.length < 2) {
            throw new ErrorResponse("At least two options are required", 400);
          }
  
          const optionsObj = options.reduce((acc, option, index) => {
            acc[`Option${index + 1}`] = option;
            return acc;
          }, {});
  
          if (!options.includes(correct_Answer)) {
            throw new ErrorResponse("Correct answer must be one of the provided options", 400);
          }
  
          await question.update({
            question: q,
            options: optionsObj,
            correct_Answer,
            time : time ? time : question.time ,
            type: type ? type : question.type,
            ageLimit : ageLimit ? ageLimit : question.ageLimit,
            questionImage: file ? file.filename : question.questionImage // Use existing image if no new file
          }, { transaction });
        } else {
          // Update or create translations
          const translation = await db.QuestionTranslation.findOne({
            where: { questionId, language },
            transaction
          });
  
          const optionsObj = options.reduce((acc, option, index) => {
            acc[`Option${index + 1}`] = option;
            return acc;
          }, {});
  
          if (translation) {
            // Update existing translation
            await translation.update({
              questions: q,
              options: optionsObj,
              correct_Answer
            }, { transaction });
          } else {
            // Create new translation
            await db.QuestionTranslation.create({
              questionId,
              language,
              questions: q,
              options: optionsObj,
              correct_Answer
            }, { transaction });
          }
        }
      }
  
      // Commit transaction
      await transaction.commit();
      return question; 
  
    } catch (error) {
      console.error('Error details:', error);
      await transaction.rollback();
      throw new ErrorResponse(`Failed to update question and translations: ${error.message}`, 500);
    }
  });


const deleteQuestion = async (query) => {
    const { questionId } = query;

    // Start a transaction
    const transaction = await db.sequelize.transaction();

    try {
        // Find the question by ID
        const question = await db.question.findOne({ where: { questionId }, transaction });
        if (!question) {
            throw new ErrorResponse("Question does not exist", 404);
        }

        // Delete related answers (this is the added part)
        await db.answer.destroy({
            where: { questionId },
            transaction,
        });

        // Delete related translations
        await db.QuestionTranslation.destroy({
            where: { questionId },
            transaction,
        });

        // Delete the question itself
        await question.destroy({ transaction });

        // Commit the transaction if everything is successful
        await transaction.commit();

        return { message: 'Question and related data deleted successfully' };

    } catch (err) {
        // Rollback the transaction in case of an error
        await transaction.rollback();
        throw new ErrorResponse(err.message || 'An error occurred during deletion', 500);
    }
};

const fetchQuestions = asyncHandler(async(query)=>{
    const {quizId} = query;
    const quiz = await db.quiz.findOne({where:{quizId}, raw:true});
    console.log(quiz);
    
    if(!quiz){
        throw new ErrorResponse("quiz not found",404)
    }
    const questions = await db.question.findAll({
        where: { quizId },
        attributes: ['questionId', 'quizId', 'question', 'options','correct_Answer','time','type','questionImage','ageLimit'],
        raw:true
      });
console.log(questions);

      const parsedQuestions = questions.map((question) => ({
        ...question,
        options: question.options,
    }));
    return parsedQuestions
})

const saveProgress = asyncHandler(async (query) => {
    const { quizId, userId, currentQuestion } = query;
    const user = await db.user.findOne({ where: { userId } });
    if (!user) {
        throw new ErrorResponse("User not found", 404);
    };

    let quiz;
    if (quizId != 0) {
        quiz = await db.quiz.findOne({ where: { quizId } });
        if (!quiz) {
            throw new ErrorResponse("Quiz not found", 404);
        }
    }

    const progressType = quizId == 0 ? 'Daily-Challenge' : 'Quiz';

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const whereClause = {
        quizId,
        userId,
        type: progressType,
    };
    let progress = await db.progress.findOne({
        where: whereClause
    });

    if (progressType === 'Daily-Challenge') {
        if (progress && progress.createdAt < startOfDay) {
            await db.progress.destroy({
                where: {
                    quizId,
                    userId,
                    type: progressType,
                    createdAt: {
                        [Op.lt]: startOfDay
                    }
                }
            });
            progress = null;
        }
    }

    if (!progress) {
        const newProgress = await db.progress.create({
            ...query,
            type: progressType
        });
        return newProgress;
    }

    if (currentQuestion !== undefined) {
        progress.currentQuestion = currentQuestion;
        await progress.save();
    }

    return progress;
});


const useOptions = asyncHandler(async (query) => {
    const { userId, quizId, optionName } = query;

    const user = await db.user.findOne({ where: { userId } });
    if (!user) {
        throw new ErrorResponse("User does not exist", 404);
    }
    let progress = await db.progress.findOne({ where: { userId, quizId } });
    if (!progress) {
        progress = await db.progress.create({
            userId,
            quizId,
            currentQuestion: 0,
            fiftyFifty: false,
            pauseTime: false,
            skip: false,
            phone: false,
            type:'Quiz'
        });
    }
    switch (optionName) {
        case 'fiftyFifty':
            progress.fiftyFifty = true;
            break;

        case 'timer':
            progress.pauseTime = true;
            break;

        case 'Skip':
            progress.skip = true;
            break;

        case 'phone':
            progress.phone = true;
            break;

        default:
            throw new ErrorResponse('Unknown option', 400);
    }
    await progress.save();

    return progress;
});


const playQUiz = asyncHandler(async (query) => {
    const { quizId, userId, page = 1, limit = 100 } = query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (isNaN(pageNumber) || pageNumber < 1) {
        throw new ErrorResponse('Invalid page number', 400);
    }
    if (isNaN(limitNumber) || limitNumber <= 0) {
        throw new ErrorResponse('Invalid limit', 400);
    }

    const user = await db.user.findOne({ where: { userId } });
    if (!user) {
        throw new ErrorResponse("User does not exist", 404);
    }

    const quiz = await db.quiz.findOne({ where: { quizId } });
    if (!quiz) {
        throw new ErrorResponse('Quiz does not exist', 400);
    }

    const userCorrectAnswers = await db.answer.findAll({
        where: { userId, isCorrect: true }
    });
    const correctAnsweredQuestionIds = userCorrectAnswers.map(answer => answer.questionId);

    let progress = await db.progress.findOne({ where: { quizId, userId } });
    if (progress && progress.currentQuestion >= 10500) {
        progress.currentQuestion = 0;
        progress.fiftyFifty = false;
        progress.phone = false;
        progress.skip = false;
        progress.pauseTime = false;
        await progress.save();
    }

    const questionsAnsweredCount = progress ? progress.currentQuestion : 0;
    const remainingQuestionsCount = Math.max(11000 - questionsAnsweredCount, 0);
    const offset = (pageNumber - 1) * limitNumber;
    const actualLimit = Math.min(limitNumber, remainingQuestionsCount);

    // Fetch English questions
    const englishQuestions = await db.question.findAll({
        where: {
            quizId,
            questionId: { [Sequelize.Op.notIn]: correctAnsweredQuestionIds },
            [Sequelize.Op.or]: [{ ageLimit: 'all' }],
        },
        attributes: ['questionId', 'quizId', 'question', 'options', 'correct_Answer', 'time', 'questionImage', 'ageLimit', 'type'],
        limit: actualLimit,
        offset,
        raw: true,
    });

    const questionIds = englishQuestions.map(q => q.questionId);

    // Fetch Gujarati translations for the same question IDs
    const gujaratiTranslations = await db.QuestionTranslation.findAll({
        where: {
            questionId: { [Sequelize.Op.in]: questionIds },
            language: 'Gujarati',
        },
        attributes: ['questionId', 'questions', 'options', 'correct_Answer'],
        raw: true,
    });

    // Map Gujarati translations by questionId for quick lookup
    const gujaratiMap = gujaratiTranslations.reduce((acc, t) => {
        acc[t.questionId] = t;
        return acc;
    }, {});

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const shuffledQuestions = shuffleArray(englishQuestions);

    quiz.totalPlays += 1;
    await quiz.save();

    await db.activity.create({
        gameId: quizId,
        game_category: 'Quiz',
        userId,
    });

    // Build final response with both English and Gujarati per question
    const parsedQuestions = shuffledQuestions.map((question) => {
        const gujarati = gujaratiMap[question.questionId];

        return {
            questionId:     question.questionId,
            quizId:         question.quizId,
            time:           question.time,
            questionImage:  question.questionImage,
            ageLimit:       question.ageLimit,
            type:           question.type,

            en: {
                question:       question.question,
                options:        typeof question.options === "string"
                                    ? JSON.parse(question.options)
                                    : question.options,
                correct_Answer: question.correct_Answer,
            },

            gu: gujarati
                ? {
                    question:       gujarati.questions,
                    options:        typeof gujarati.options === "string"
                                        ? JSON.parse(gujarati.options)
                                        : gujarati.options,
                    correct_Answer: gujarati.correct_Answer,
                }
                : null, // null if no Gujarati translation exists for this question
        };
    });

    return parsedQuestions;
});


const fetchRandomQuestions = asyncHandler(async (userId) => {

    const answeredQuestions = await db.answer.findAll({
        attributes: ['questionId'],
        where: { userId, isCorrect: true }
    });
    const answeredQuestionIds = answeredQuestions.map(a => a.questionId);

    const quizzes = await db.quiz.findAll({
        attributes: ['quizId']
    });
    const quizIds = quizzes.map(q => q.quizId);

    const questions = await db.question.findAll({
        where: {
            quizId: { [Op.in]: quizIds },
            questionId: { [Op.notIn]: answeredQuestionIds }
        },
        order: [Sequelize.literal('RAND()')],
        limit: 25
    });

    const questionIds = questions.map((question) => question.questionId); 

    const questionTranslation = await db.QuestionTranslation.findAll({
        where: {
            questionId: { [Op.in]: questionIds }
        }
    });

    const parsedQuestions = questions.map((question) => ({
        ...question.toJSON(),
        options: typeof question.options === "string"
            ? JSON.parse(question.options)
            : question.options,
    }));

    const parsedQuestionsTranslation = questionTranslation.map((question) => ({
        ...question.toJSON(),
        options: typeof question.options === "string"
            ? JSON.parse(question.options)
            : question.options,
    }));

    return {         
        eng: parsedQuestions,
        gu: parsedQuestionsTranslation
    };
});

    const dailyQuestionsCache = {
        eng: {
            lastFetchDate: null,
            questions: []
        },
        gu: {
            lastFetchDate: null,
            questions: []
        }
    };


const dailyChallenge = asyncHandler(async (query) => {
    const { userId } = query; // no lang needed

    const questions = await fetchRandomQuestions(userId);

    return {
        date: new Date().toISOString().split('T')[0],
        eng: questions['eng'],
        gu: questions['gu']
    };
});

const quizAnswer = asyncHandler(async (body) => {
    const { userId, questionId, isCorrect, option } = body;
    console.log(body);
    const transaction = await db.sequelize.transaction();

    try {
        const existing_user = await db.user.findOne({ where: { userId }, transaction });
        if (!existing_user) {
            throw new ErrorResponse("User does not exist", 404);
        }

        const existing_question = await db.question.findOne({ where: { questionId }, transaction });
        if (!existing_question) {
            throw new ErrorResponse("Question does not exist", 404);
        }

        const existing_answer = await db.answer.findOne({
            where: { userId, questionId },
            transaction
        });

        if (existing_answer) {
            if (existing_answer.isCorrect !== isCorrect) {
                await existing_answer.update({ isCorrect }, { transaction });
            }
        } else {
            const data = {
                userId,
                questionId,
                isCorrect
            };
            const create_answer = await db.answer.create({ ...data }, { transaction });
            console.log("Answer created");
        }
        await transaction.commit();
        return { message: "Answer saved successfully" };

    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }
        throw error;
    }
});

const fetchWordSearchDetails = asyncHandler(async (query) => {
    const { userId, lang } = query;
    if (!['en', 'gu'].includes(lang.toLowerCase())) {
        throw new ErrorResponse("Invalid language parameter. Choose either 'en' or 'gu'.", 400);
    }
    const isGujrati = lang.toLowerCase() === 'gu';
    const totalWordSearchGames = await db.Search.count();
    const completedGameIds = await db.gameAnswer.findAll({
        attributes: ['gameId'],
        where: {
            userId,
            isCorrect: true
        },
        group: ['gameId'],
        raw: true
    });
    const completedGamesCount = completedGameIds.length;
    const remainingGames = totalWordSearchGames - completedGamesCount;
    const totalUsers = await db.user.count();
    return {
        levels:remainingGames,
        totalUsers
    };
  });

export default {
    fetchWordSearchDetails,
    quizAnswer,
    dailyChallenge,
    fetchuserquiz,
    useOptions,
    deleteQuestion,
    updateQuestion,
    fetchQuestions,
    createQUiz,
    saveProgress,
    updateQuiz,
    deleteQuiz,
    fetchQuizzes,
    createQuestion,
    fetchadminquestions,
    fetchadminQuizzes,
    createQuestionFromExcel,
    playQUiz
};;


