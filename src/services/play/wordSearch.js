import asyncHandler from "../../middleware/async.js";
import ErrorResponse from "../../utlis/ErrorResponse.js";
import db from "../../config/db.js";
import Sequelize from "sequelize";
import XLSX from "xlsx";
import fs from "fs";
const matraData = ['ુ', 'ા', '', 'ી', 'ે', 'ૈ', 'ો', '','્'];

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
const generateGrid = (validWords = [], gridSize = 10, isGujrati = false) => {
    let grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(''));
    const hints = [];
    const directions = [
        { x: 0, y: 1 }, 
        { x: 0, y: -1 },
        { x: 1, y: 0 }, 
        { x: -1, y: 0 },
        { x: 1, y: 1 },
        { x: -1, y: -1 },
        { x: 1, y: -1 },
        { x: -1, y: 1 }
    ];
    const diagonalWords = validWords.filter(word => word.length >= 3 && word.length <= 4);
    const otherWords = validWords.filter(word => word.length < 3 || word.length > 4);
    const canFitWord = (word, direction, startRow, startCol) => {
        console.log(word,'ddd')
        let row = startRow;
        let col = startCol;
        for (let i = 0; i < word.length; i++) {
            console.log(word[i])
            if (
                row >= gridSize || col >= gridSize || row < 0 || col < 0 ||
                (grid[row][col] !== '' && grid[row][col] !== word[i])
            ) {
                return false;
            }
            row += direction.x;
            col += direction.y;
        }
        return true;
    };
    const placeWord = (words, directionsToTry) => {
        const word = processGujaratiText(words)
        console.log(word) 
        let placed = false;
        for (let direction of directionsToTry) {
            for (let attempt = 0; attempt < 100; attempt++) { 
                const startRow = Math.floor(Math.random() * gridSize);
                const startCol = Math.floor(Math.random() * gridSize);
                if (canFitWord(word, direction, startRow, startCol)) {
                    let row = startRow;
                    let col = startCol;

                    for (let i = 0; i < word.length; i++) {
                        grid[row][col] = word[i];
                        row += direction.x;
                        col += direction.y;
                    }
                    hints.push({
                        word: word,
                        startRow: startRow,
                        startCol: startCol,
                        direction: direction.name
                    });
                    
                    placed = true;
                    break;
                }
            }
            if (placed) break;
        }
        if (!placed) {
            console.log(`Failed to place word "${word}".`);
        }
        return placed;
    };
    const fillEmptyCells = () => {
        const gujaratiBaseCharacters = "અઆઇઈઉઊઍએઐઓઔકગઙઝટઠડણતદધપબમયરલવશસહ".split('');
        const alphabet = isGujrati ? gujaratiBaseCharacters : "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
        grid = grid.map(row => 
            row.map(cell => {
                if (isGujrati) {
                    return cell === '' ? alphabet[Math.floor(Math.random() * alphabet.length)] : cell;
                }
                return cell === '' ? alphabet[Math.floor(Math.random() * alphabet.length)] : cell;
            })
        );
        };

    diagonalWords.forEach(word => {
        const diagonalDirections = [
            { x: 1, y: 1, name: 'Diagonal down-right' },   
            { x: -1, y: -1, name: 'Diagonal up-left' },
            { x: 1, y: -1, name: 'Diagonal down-left' },
            { x: -1, y: 1, name: 'Diagonal up-right' }
        ];

        if (!placeWord(word, diagonalDirections)) {
            console.log(`Failed to place diagonal word "${word}".`);
        }
    });
    otherWords.forEach(word => {
        const horizontalAndVerticalDirections = [
            { x: 0, y: 1, name: 'left-to-right' },  
            { x: 0, y: -1, name: 'right-to-left' }, 
            { x: 1, y: 0, name: 'top-to-bottom' },   
            { x: -1, y: 0, name: 'bottom-to-top' }
        ];
        if (!placeWord(word, horizontalAndVerticalDirections)) {
            console.log(`Failed to place horizontal/vertical word "${word}".`);
        }
    });
    fillEmptyCells();
    console.log(hints)
    return {
        grid,
        hints
    };
};

const createWordSearch = asyncHandler(async (body) => {
    console.log("Request body:", body);
    const { level, validWords, titles, languages, isGujrati = false } = body;
    if (!level || !Array.isArray(validWords) || !Array.isArray(titles) || !Array.isArray(languages) || 
        validWords.length === 0 || titles.length === 0 || languages.length === 0 || 
        validWords.length !== titles.length || validWords.length !== languages.length) {
    throw new ErrorResponse("Invalid input data. Please provide valid arrays for level, validWords, titles, and languages with the same length.", 400);
    }
    for (const words of validWords) {
    if (!Array.isArray(words) || !words.every(word => typeof word === 'string')) {
        throw new ErrorResponse("Invalid validWords array. Each element must be an array of strings.", 400);
    }
    }
    const isGujratiBool = typeof isGujrati === 'string'
    ? isGujrati.toLowerCase() === 'true'
    : Boolean(isGujrati);
    const transaction = await db.sequelize.transaction();
    try {
    const englishIndex = languages.findIndex(lang => lang.toLowerCase() === 'english');
    if (englishIndex === -1) {
        throw new ErrorResponse("English language data is required", 400);
    }
    const searchData = {
        level,
        title: titles[englishIndex],     
        validWords: JSON.stringify(validWords[englishIndex]),  // ✅
        isGujrati: isGujratiBool,
        language: languages[englishIndex]
    };

    console.log("Search data (English):", searchData);
    const newSearch = await db.Search.create(searchData, { transaction });
    console.log("Created Search:", newSearch);
    const translations = languages.map((lang, index) => {
    if (index !== englishIndex) { 
        return {
        gameId: newSearch.gameId,
        language: lang, 
        title: titles[index],
        validWords: JSON.stringify(validWords[index]),  // ✅
        };
    }
    }).filter(Boolean);

    console.log("Translations to create (non-English):", translations);
    await db.SearchTranslation.bulkCreate(translations, { transaction });
    await transaction.commit();

    return {
        gameId: newSearch.gameId,
        translations: translations.map((translation) => ({
        language: translation.language,
        title: translation.title,
        validWords: JSON.parse(translation.validWords)
        }))
    };
    } catch (error) {
    console.error('Error details:', error);
    await transaction.rollback();
    throw new ErrorResponse(`Failed to create word search and translations: ${error.message}`, 500);
    }
});

const updateWordSearch = asyncHandler(async (body, query) => {
    const { gameId } = query;
    console.log("Game ID:", gameId);

    const { level, validWords, titles, languages, isGujrati = false } = body;

    if (!gameId || !level || !Array.isArray(validWords) || !Array.isArray(titles) || !Array.isArray(languages) || 
        validWords.length === 0 || titles.length === 0 || languages.length === 0 || 
        validWords.length !== titles.length || validWords.length !== languages.length) {
        throw new ErrorResponse("Invalid input data. Please provide valid arrays for level, validWords, titles, and languages with the same length.", 400);
    }

    for (const words of validWords) {
        if (!Array.isArray(words) || !words.every(word => typeof word === 'string')) {
            throw new ErrorResponse("Invalid validWords array. Each element must be an array of strings.", 400);
        }
    }

    const isGujratiBool = typeof isGujrati === 'string'
        ? isGujrati.toLowerCase() === 'true'
        : Boolean(isGujrati);

    const transaction = await db.sequelize.transaction();

    try {
        // Find the existing word search
        const existingSearch = await db.Search.findOne({ where: { gameId } });

        if (!existingSearch) {
            throw new ErrorResponse("Word search not found", 404);
        }

        const englishIndex = languages.findIndex(lang => lang.toLowerCase() === 'english');
        if (englishIndex === -1) {
            throw new ErrorResponse("English language data is required", 400);
        }

        // Update the main word search data (English)
        existingSearch.level = level;
        existingSearch.title = titles[englishIndex];
        existingSearch.validWords = validWords[englishIndex];
        existingSearch.isGujrati = isGujratiBool;
        await existingSearch.save({ transaction });

        // Update or create translations (non-English)
        const translations = languages.map((lang, index) => {
            if (index !== englishIndex) {
                return {
                    gameId: existingSearch.gameId,
                    language: lang,
                    title: titles[index],
                    validWords: validWords[index]
                };
            }
        }).filter(Boolean);

        await db.SearchTranslation.destroy({ where: { gameId: existingSearch.gameId }, transaction });
        await db.SearchTranslation.bulkCreate(translations, { transaction });

        await transaction.commit();

        return {
            gameId: existingSearch.gameId,
            translations: translations.map((translation) => ({
                language: translation.language,
                title: translation.title,
                validWords: translation.validWords
            }))
        };

    } catch (error) {
        console.error('Error details:', error);
        await transaction.rollback();
        throw new ErrorResponse(`Failed to update word search and translations: ${error.message}`, 500);
    }
});


const deleteWordSearch = asyncHandler(async (query) => {
    const { gameId } = query;
    const search = await db.Search.findOne({where:{gameId}});
    if (!search) {
        throw new ErrorResponse("Word search not found", 404);
    }
    await search.destroy();
    return {
        success: true,
        data: {}
    };
});

/* const playWordSearch = asyncHandler(async (query) => {
    const { lang, page = 1, userId } = query;
    const pageSize = 10;
  
    // Language Validation (using a mapping for shorter code)
    const langCodeMap = {
      'en': 'english',
      'guj': 'gujarati',
      'es': 'spanish'
      // Add more language short codes as needed
    };
    const fullLang = langCodeMap[lang.toLowerCase()];
  
    if (!fullLang) {
      throw new ErrorResponse(`Invalid language parameter. Choose one of: ${Object.keys(langCodeMap).join(', ')}`, 400);
    }
  
    const offset = (page - 1) * pageSize;
    const limit = pageSize;
  
    const transaction = await db.sequelize.transaction();
    try {
      const totalSearches = await db.Search.count({ where: { language: fullLang } });
  
      const answeredGameIds = await db.gameAnswer.findAll({
        attributes: ['gameId'],
        where: { isCorrect: true, userId, type: 'Word-search' },
        group: ['gameId'],
        raw: true
      });
      const answeredGameIdSet = new Set(answeredGameIds.map(answer => answer.gameId));
  
      const searchResults = [];
      let allValidWords = [];
      let currentOffset = offset;
      let fetchedGames = 0;
  
      while (fetchedGames < pageSize) {
        const searches = await db.Search.findAll({
          where: { language: fullLang },
          include: [{
            model: db.SearchTranslation,
            as: 'translations'
          }],
          order: [['level', 'ASC']],
          offset: currentOffset,
          limit
        });
  
        if (!searches || searches.length === 0) {
          break;
        }
  
        for (const search of searches) {
          if (answeredGameIdSet.has(search.gameId)) {
            continue;
          }
  
          try {
            let validWords = typeof search.validWords === 'string'
              ? JSON.parse(search.validWords)
              : search.validWords;
  
            if (!Array.isArray(validWords)) {
              throw new Error("Invalid validWords format");
            }
  
            allValidWords.push(...validWords);
            const gridSize = calculateGridSize(validWords);
            const isGujarati = fullLang === 'gujarati';
            const grid = generateGrid(validWords, gridSize, isGujarati);
  
            const title = search.translations[0]?.title || search.title;
  
            searchResults.push({
              grid: grid.grid,
              validWords,
              level: search.level,
              title: title,
              hints: grid.hints,
              gameId: search.gameId
            });
  
            fetchedGames++;
            if (fetchedGames >= pageSize) {
              break;
            }
  
          } catch (error) {
            console.warn(`Skipping search record with invalid validWords format: ${JSON.stringify(search)}. Error: ${error.message}`);
          }
        }
        currentOffset += limit;
      }
  
      allValidWords = [...new Set(allValidWords)];
      if (allValidWords.length === 0) {
        throw new ErrorResponse("No valid words available for grid generation", 400);
      }
  
      if (searchResults.length === 0) {
        throw new ErrorResponse(`No ${fullLang} word searches found`, 404);
      }
  
      await db.activity.create({
        gameId: searchResults[0]?.gameId,
        game_category: 'Word_Search',
        userId
      }, { transaction });
  
      const totalPages = Math.ceil(totalSearches / pageSize);
      await transaction.commit();
  
      return {
        totalPages,
        page,
        searches: searchResults
      };
  
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }); */// Adjust the import according to your project structure

const playWordSearch = asyncHandler(async (query) => {
  const { page = 1, userId } = query;
  const pageSize = 10;

  const allLanguages = ['English', 'Gujarati'];

  const offset = (page - 1) * pageSize;
  const limit = pageSize;

  const transaction = await db.sequelize.transaction();
  try {
    // Fetch game IDs the user has already answered correctly (all types)
    const answeredGameIds = await db.gameAnswer.findAll({
      attributes: ['gameId'],
      where: { isCorrect: true, userId, type: 'Word-search' },
      group: ['gameId'],
      raw: true
    });

    const answeredGameIdSet = new Set(answeredGameIds.map(answer => answer.gameId));

    // Fetch total searches count across all languages (use English as base to avoid duplicates)
    const totalSearches = await db.Search.count();
    const totalPages = Math.ceil(totalSearches / pageSize);

    // Fetch base English searches (paginated) — English is source of truth for gameId, level, total_plays
    const baseSearches = await db.Search.findAll({
      order: [['level', 'ASC']],
      offset,
      limit
    });

    if (!baseSearches || baseSearches.length === 0) {
      throw new ErrorResponse(`No word searches found`, 404);
    }

    const gameIds = baseSearches.map(s => s.gameId);

    // Fetch all translations for these gameIds across all non-English languages
    const allTranslations = await db.SearchTranslation.findAll({
      where: {
        gameId: { [Sequelize.Op.in]: gameIds }
      }
    });
    console.log("Translation Word: ", allTranslations);
    

    // Build a nested map: { gameId -> { language -> translationRecord } }
    const translationsMap = new Map();
    allTranslations.forEach(t => {
      if (!translationsMap.has(t.gameId)) {
        translationsMap.set(t.gameId, new Map());
      }
      translationsMap.get(t.gameId).set(t.language, t);
    });

    const searchResults = [];

    for (const search of baseSearches) {
      if (answeredGameIdSet.has(search.gameId)) {
        continue; // Skip already answered games
      }

      try {
        // Validate and parse validWords
        let validWords = typeof search.validWords === 'string'
          ? JSON.parse(search.validWords)
          : search.validWords;

        if (!Array.isArray(validWords)) {
          throw new Error("Invalid validWords format");
        }

        validWords = validWords.map(word => word.toUpperCase());

        const level = search.level;
        const totalPlays = search.total_plays || 0;

        // Build per-language data
        const languageData = {};

        for (const lang of allLanguages) {
          const isGujarati = lang === 'Gujarati';

          // For non-English, try to get translated validWords if stored in translation
          let langValidWords = validWords;
          let title = search.title; // fallback to English title

          if (lang !== 'English') {
            const translation = translationsMap.get(search.gameId)?.get(lang);
            if (translation) {
              title = translation.title || search.title;

              // If translations store their own validWords, parse them
              if (translation.validWords) {
                try {
                  const translatedWords = typeof translation.validWords === 'string'
                    ? JSON.parse(translation.validWords)
                    : translation.validWords;

                  if (Array.isArray(translatedWords)) {
                    langValidWords = translatedWords.map(w => w.toUpperCase());
                  }
                } catch {
                  langValidWords = validWords; // fallback to English words
                }
              }
            }
          }

          const gridSize = calculateGridSize(langValidWords);
          const grid = generateGrid(langValidWords, gridSize, isGujarati);

          languageData[lang] = {
            title,
            validWords: langValidWords,
            grid: grid.grid,
            hints: grid.hints
          };
        }

        searchResults.push({
          gameId: search.gameId,
          level,
          totalPlays,
          languages: languageData  // all languages nested under one game entry
        });

      } catch (error) {
        console.warn(`Skipping search record gameId ${search.gameId}. Error: ${error.message}`);
      }
    }

    if (searchResults.length === 0) {
      throw new ErrorResponse(`No word searches found`, 404);
    }

    await db.activity.create({
      gameId: searchResults[0]?.gameId,
      game_category: 'Word_Search',
      userId
    }, { transaction });

    await transaction.commit();

    return {
      totalPages,
      page,
      searches: searchResults
    };

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

function calculateGridSize(words) {
    console.log(words);
    
    let longestWord = '';
    let longestWordLength = 0;
    
    words.forEach(word => {
        if (word.length > longestWordLength) {
            longestWord = word;
            longestWordLength = word.length;
        }
    });

    console.log('Longest Word:', longestWord);
    console.log('Longest Word Length:', longestWordLength);
    
    const gridSize = longestWordLength;
    console.log('Calculated Grid Size:', gridSize);
    return Math.min(Math.max(gridSize, 10), 10);
}



const fetchWordSearch = asyncHandler(async () => {
    try {
        const safeParse = (value) => {
            if (Array.isArray(value)) return value;
            try {
                return JSON.parse(value);
            } catch {
                // Handle old comma-separated format gracefully
                return typeof value === 'string' ? value.split(',') : [];
            }
        };
        const wordSearches = await db.Search.findAll();
        const availableWordSearches = await Promise.all(wordSearches.map(async (search) => {
            // Parse valid words from the search
            const validWords = safeParse(search.validWords);    

            // Fetch translations for the current game
            const translations = await db.SearchTranslation.findAll({
                where: {
                    gameId: search.gameId,
                },
            });

            // Map over translations to extract the necessary fields
            const translationArray = translations.map((translation) => ({
                language: translation.language,
                title: translation.title,
                validWords : safeParse(translation.validWords),     //
                level: search.level, // Add level to each translation
                totalPlays: search.total_plays, // Add total plays to each translation
            }));

            // Check if English translation exists, if not add one
            const englishTranslation = translationArray.find(t => t.language === 'English');
            if (!englishTranslation) {
                translationArray.push({
                    language: 'English',
                    title: search.title,
                    validWords: validWords,
                    level: search.level, // Add level for English
                    total_plays: search.total_plays, // Add total plays for English
                });
            }

            // Return the structured object with translations and parent data
            return {
                gameId: search.gameId,
                level: search.level, // Add level to parent object
                total_plays: search.total_plays, // Add total plays to parent object
                translations: translationArray,
                isGujrati: search.isGujrati,
            };
        }));

        return availableWordSearches.filter(search => search !== null); 
    } catch (error) {
        console.error('Error fetching word search:', error);
        throw new ErrorResponse('Failed to fetch word search data', 500);
    }
});

const createWordSearchFromExcel = asyncHandler(async (file) => {
    if (!file) {
        return next(new ErrorResponse('Please upload an Excel file', 400));
    }   
    console.log('Uploaded file:', file.originalname);
    const fileBuffer = fs.readFileSync(file.path);

    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    console.log('Workbook:', workbook);
    const sheetName = workbook?.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    console.log('Workbook SheetNames:', workbook.SheetNames);
    console.log(`Processing sheet: ${sheetName}`);
    console.log('Worksheet:', worksheet);
    console.log('Parsed JSON Data:', jsonData);

    if (jsonData.length < 2) {
        return next(new ErrorResponse('Excel file is empty or does not contain data', 400));
    }

    const headers = jsonData[0];
    const requiredHeaders = ['Level', 'Language', 'Title', 'ValidWords'];
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));

    if (missingHeaders.length > 0) {
        return next(new ErrorResponse(`Missing required headers: ${missingHeaders.join(', ')}`, 400));
    }
    const headerMap = {};
    headers.forEach((header, index) => {
        headerMap[header] = index;
    });
    const wordSearchEntries = {};

    for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        const level = row[headerMap['Level']];
        const language = row[headerMap['Language']];
        const title = row[headerMap['Title']];
        const validWords = row[headerMap['ValidWords']].split(',').map(word => word.trim()).filter(word => word !== '');
        if (!level || !language || !title || validWords.length === 0) {
            console.warn(`Row ${i + 1} is invalid and will be skipped.`);
            continue;
        }

        if (!wordSearchEntries[level]) {
            wordSearchEntries[level] = {
                languages: [],
                titles: [],
                validWords: []
            };
        }

        wordSearchEntries[level].languages.push(language);
        wordSearchEntries[level].titles.push(title);
        wordSearchEntries[level].validWords.push(validWords);
    }
    const createdWordSearches = [];
    for (const level in wordSearchEntries) {
        const { languages, titles, validWords } = wordSearchEntries[level];
        const minimumRequiredLanguages = ['English']; // Only English is mandatory
        const missingLanguages = minimumRequiredLanguages.filter(lang => !languages.includes(lang));

        if (missingLanguages.length > 0) {
            console.warn(`Level ${level} is missing required languages: ${missingLanguages.join(', ')}. Skipping this level.`);
            continue;
        }

        const englishIndex = languages.findIndex(lang => lang.toLowerCase() === 'english');
        if (englishIndex === -1) {
            console.warn(`Level ${level} does not contain English language. Skipping this level.`);
            continue;
        }

        const levelNumber = parseInt(level, 10);
        if (isNaN(levelNumber)) {
            console.warn(`Level "${level}" is not a valid number. Skipping this level.`);
            continue;
        }

        const isGujrati = languages.includes('Gujarati');
        const requestData = {
            level: levelNumber,
            titles,
            validWords,
            languages,
            isGujrati
        };
        const createdSearch = await createWordSearch(requestData);
        createdWordSearches.push(createdSearch);
    }

    return {
        success: true,
        count: createdWordSearches.length,
        data: createdWordSearches
    };
});

export default {
    createWordSearchFromExcel,
    fetchWordSearch,
    createWordSearch,
    updateWordSearch,
    deleteWordSearch,
    playWordSearch
};;
