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
// Utility: shuffle an array in place (Fisher-Yates)
const shuffleArray = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const ALL_DIRECTIONS = [
  { x: 0,  y:  1, name: 'left-to-right'    },
  { x: 0,  y: -1, name: 'right-to-left'    },
  { x: 1,  y:  0, name: 'top-to-bottom'    },
  { x: -1, y:  0, name: 'bottom-to-top'    },
  { x: 1,  y:  1, name: 'diagonal-down-right' },
  { x: -1, y: -1, name: 'diagonal-up-left'    },
  { x: 1,  y: -1, name: 'diagonal-down-left'  },
  { x: -1, y:  1, name: 'diagonal-up-right'   },
];

const generateGrid = (validWords = [], gridSize = 10, isGujrati = false) => {
  // ── 1. Pre-process all words into token arrays once ──────────────────────
  const processedWords = validWords.map((word) => ({
    raw: word,
    tokens: processGujaratiText(word), // array of grapheme clusters / chars
  }));

  // ── 2. Sort longest-first so big words claim space before small ones ──────
  processedWords.sort((a, b) => b.tokens.length - a.tokens.length);

  let grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(''));
  const hints = [];

  // ── 3. Core fit check (works on pre-processed token arrays) ──────────────
  const canFitWord = (tokens, direction, startRow, startCol) => {
    let row = startRow;
    let col = startCol;
    for (const token of tokens) {
      if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) return false;
      if (grid[row][col] !== '' && grid[row][col] !== token) return false;
      row += direction.x;
      col += direction.y;
    }
    return true;
  };

  // ── 4. Place a single word with randomised directions + positions ─────────
  const placeWord = ({ raw, tokens }) => {
    // Which directions are legal for this word length?
    // Words longer than gridSize can't fit diagonally or straight — skip those.
    const validDirections = ALL_DIRECTIONS.filter((dir) => {
      // For diagonal, word must fit within both axes
      if (dir.x !== 0 && dir.y !== 0) return tokens.length <= gridSize;
      return true;
    });

    // Shuffle directions for variety every single placement
    const shuffledDirs = shuffleArray([...validDirections]);

    for (const direction of shuffledDirs) {
      // Generate ALL valid starting positions, then shuffle them
      const positions = [];
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          if (canFitWord(tokens, direction, r, c)) {
            positions.push({ r, c });
          }
        }
      }

      if (positions.length === 0) continue;

      // Pick a random valid position (not always the first one found)
      const { r: startRow, c: startCol } =
        positions[Math.floor(Math.random() * positions.length)];

      // Commit to grid
      let row = startRow;
      let col = startCol;
      for (const token of tokens) {
        grid[row][col] = token;
        row += direction.x;
        col += direction.y;
      }

      hints.push({
        word: tokens,
        startRow,
        startCol,
        direction: direction.name,
      });

      return true;
    }

    console.warn(`Could not place word: "${raw}"`);
    return false;
  };

  // ── 5. Place all words ────────────────────────────────────────────────────
  for (const wordEntry of processedWords) {
    placeWord(wordEntry);
  }

  // ── 6. Fill empty cells with random filler ────────────────────────────────
  const GUJARATI_FILLERS = 'અઆઇઈઉઊઍએઐઓઔકખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમયરલળવશષસહ'.split('');
  const ENGLISH_FILLERS  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const fillers = isGujrati ? GUJARATI_FILLERS : ENGLISH_FILLERS;

  grid = grid.map((row) =>
    row.map((cell) =>
      cell === '' ? fillers[Math.floor(Math.random() * fillers.length)] : cell
    )
  );

  return { grid, hints };
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

const playWordSearch = asyncHandler(async (query) => {
  const { page = 1, userId } = query;
  const pageSize = 10;
  const pageNum = parseInt(page, 10) || 1;
  const offset   = (pageNum - 1) * pageSize;

  // ── 1. Answered games (only fetch IDs, not full rows) ──────────────────
  const answeredRows = await db.gameAnswer.findAll({
    attributes: ['gameId'],
    where:      { isCorrect: true, userId, type: 'Word-search' },
    group:      ['gameId'],
    raw:        true,
  });
  const answeredSet = new Set(answeredRows.map((r) => r.gameId));

  // ── 2. Pagination meta ──────────────────────────────────────────────────
  const totalSearches = await db.Search.count();
  const totalPages    = Math.ceil(totalSearches / pageSize);

  // ── 3. Fetch base (English) records — only columns we actually need ─────
  const baseSearches = await db.Search.findAll({
    attributes: ['gameId', 'level', 'title', 'validWords', 'total_plays', 'language'],
    order:      [['level', 'ASC']],
    offset,
    limit:      pageSize,
  });

  if (!baseSearches.length) {
    throw new ErrorResponse('No word searches found', 404);
  }

  // ── 4. Batch-fetch translations for this page's gameIds only ───────────
  const gameIds = baseSearches.map((s) => s.gameId);

  const allTranslations = await db.SearchTranslation.findAll({
    attributes: ['gameId', 'language', 'title', 'validWords'],
    where:      { gameId: { [Sequelize.Op.in]: gameIds } },
  });

  // { gameId -> { language -> record } }
  const translationsMap = new Map();
  for (const t of allTranslations) {
    if (!translationsMap.has(t.gameId)) translationsMap.set(t.gameId, new Map());
    translationsMap.get(t.gameId).set(t.language, t);
  }

  // ── 5. Build response ───────────────────────────────────────────────────
  const searchResults = [];

  for (const search of baseSearches) {
    if (answeredSet.has(search.gameId)) continue;

    try {
      // Parse & validate English words
      const englishWords = parseAndValidateWords(search.validWords);

      // Determine which languages are available for this game
      const availableLanguages = ['English'];
      const gameTranslations = translationsMap.get(search.gameId);
      if (gameTranslations) {
        for (const lang of gameTranslations.keys()) availableLanguages.push(lang);
      }

      const languageData = {};

      for (const lang of availableLanguages) {
        const isGujarati = lang.toLowerCase() === 'gujarati';

        let langWords = englishWords;
        let title     = search.title;

        if (lang !== 'English') {
          const translation = gameTranslations?.get(lang);
          if (translation) {
            title     = translation.title || search.title;
            langWords = parseAndValidateWords(translation.validWords, englishWords);
            // Don't toUpperCase Gujarati — it has no case
          }
        } else {
          langWords = englishWords.map((w) => w.toUpperCase());
        }

        const gridSize = calculateGridSize(langWords);
        const grid     = generateGrid(langWords, gridSize, isGujarati);

        languageData[lang] = {
          title,
          validWords: langWords,
          grid:       grid.grid,
          hints:      grid.hints,
        };
      }

      searchResults.push({
        gameId:     search.gameId,
        level:      search.level,
        totalPlays: search.total_plays || 0,
        languages:  languageData,
      });
    } catch (err) {
      console.warn(`Skipping gameId ${search.gameId}: ${err.message}`);
    }
  }

  if (searchResults.length === 0) {
    throw new ErrorResponse('No word searches found', 404);
  }

  // ── 6. Log activity — use a short-lived transaction only where needed ───
  const transaction = await db.sequelize.transaction();
  try {
    await db.activity.create(
      {
        gameId:        searchResults[0].gameId,
        game_category: 'Word_Search',
        userId,
      },
      { transaction }
    );
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    // Activity logging failure should NOT fail the whole request
    console.error(`Activity log failed for userId ${userId}:`, err.message);
  }

  return { totalPages, page: pageNum, searches: searchResults };
});

// ── Helper: safely parse validWords, fall back to `fallback` array ────────
const parseAndValidateWords = (raw, fallback = null) => {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // fall through
  }
  if (fallback) return fallback;
  throw new Error('Invalid validWords format');
};

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
        const wordSearches = await db.Search.findAll({
            order: [['level', 'ASC']],
        });
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

const createBulkWordSearch = asyncHandler(async (body) => {
  // ── 1. Accept both a single object and an array ──────────────────────────
  const entries = Array.isArray(body) ? body : [body];

  if (entries.length === 0) {
    throw new ErrorResponse("Request body must contain at least one word-search entry.", 400);
  }

  // ── 2. Validate every entry up-front before touching the DB ──────────────
  for (const [i, entry] of entries.entries()) {
    const { level, validWords, titles, languages } = entry;
    const prefix = `Entry[${i}]`;

    if (!level) {
      throw new ErrorResponse(`${prefix}: 'level' is required.`, 400);
    }

    for (const [field, value] of [["validWords", validWords], ["titles", titles], ["languages", languages]]) {
      if (!Array.isArray(value) || value.length === 0) {
        throw new ErrorResponse(`${prefix}: '${field}' must be a non-empty array.`, 400);
      }
    }

    if (validWords.length !== titles.length || validWords.length !== languages.length) {
      throw new ErrorResponse(
        `${prefix}: 'validWords', 'titles', and 'languages' must all have the same length.`,
        400
      );
    }

    for (const [j, words] of validWords.entries()) {
      if (!Array.isArray(words) || !words.every((w) => typeof w === "string")) {
        throw new ErrorResponse(
          `${prefix}: validWords[${j}] must be an array of strings.`,
          400
        );
      }
    }

    const hasEnglish = languages.some((lang) => lang.toLowerCase() === "english");
    if (!hasEnglish) {
      throw new ErrorResponse(`${prefix}: English language data is required.`, 400);
    }
  }

  // ── 3. Persist all entries in a single transaction ────────────────────────
  const transaction = await db.sequelize.transaction();

  try {
    const results = await Promise.all(
      entries.map(async (entry) => {
        const {
          level,
          validWords,
          titles,
          languages,
          isGujrati = false,
        } = entry;

        const isGujratiBool =
          typeof isGujrati === "string"
            ? isGujrati.toLowerCase() === "true"
            : Boolean(isGujrati);

        const englishIndex = languages.findIndex(
          (lang) => lang.toLowerCase() === "english"
        );

        // Create the primary (English) record
        const newSearch = await db.Search.create(
          {
            level,
            title: titles[englishIndex],
            validWords: JSON.stringify(validWords[englishIndex]),
            isGujrati: isGujratiBool,
            language: languages[englishIndex],
          },
          { transaction }
        );

        // Build translation rows (all non-English languages)
        const translations = languages
          .map((lang, idx) =>
            idx !== englishIndex
              ? {
                  gameId: newSearch.gameId,
                  language: lang,
                  title: titles[idx],
                  validWords: JSON.stringify(validWords[idx]),
                }
              : null
          )
          .filter(Boolean);

        if (translations.length > 0) {
          await db.SearchTranslation.bulkCreate(translations, { transaction });
        }

        return {
          gameId: newSearch.gameId,
          level,
          translations: translations.map((t) => ({
            language: t.language,
            title: t.title,
            validWords: JSON.parse(t.validWords),
          })),
        };
      })
    );

    await transaction.commit();
    return results;
  } catch (error) {
    await transaction.rollback();
    // Re-throw known validation errors as-is
    if (error instanceof ErrorResponse) throw error;
    throw new ErrorResponse(
      `Failed to create word searches: ${error.message}`,
      500
    );
  }
});


export default {
    createWordSearchFromExcel,
    fetchWordSearch,
    createWordSearch,
    updateWordSearch,
    deleteWordSearch,
    playWordSearch,
    createBulkWordSearch
};;
