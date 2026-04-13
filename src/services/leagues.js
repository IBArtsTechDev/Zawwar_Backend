import db from "../../src/config/db.js";
import asyncHandler from "../../src/middleware/async.js";
import ErrorResponse from "../../src/utlis/ErrorResponse.js";

const fetchLeagues = asyncHandler(async (query) => {
    const { lang } = query;
    let whereCondition = {};
    if (lang === 'guj') {
        whereCondition.isGujrati = true;
    } else if (lang === 'eng') {
        whereCondition.isGujrati = false;
    }
    const quizzes = await db.quiz.findAll({
        where: whereCondition,
    });
    const leagues = [
        {
            leagueName: "શબ્દો ઓળખો",
            levels: "25",
            isGujrati: true
        },
        {
            leagueName: "Guess The Word",
            levels: "25",
            isGujrati: false
        },
        {
            leagueName: "ચિત્ર ઓળખો",
            levels: "25",
            isGujrati: true
        },
        {
            leagueName: "Guess The Image",
            levels: "25",
            isGujrati: false
        },
        {
            leagueName: "સ્ક્રેબલ",
            levels: "25",
            isGujrati: true
        },
        {
            leagueName: "Scrabble",
            levels: "25",
            isGujrati: false
        },
        {
            leagueName: "શબ્દ શોધો",
            levels: "25",
            isGujrati: true
        },
        {
            leagueName: "Word Search",
            levels: "25",
            isGujrati: false
        }
    ];

    const filteredLeagues = leagues.filter(league => league.isGujrati === whereCondition.isGujrati);
    const result = {
        guessTheWord: filteredLeagues.find(league => league.leagueName === (whereCondition.isGujrati ? "શબ્દો ઓળખો" : "Guess The Word")),
        guessTheImage: filteredLeagues.find(league => league.leagueName === (whereCondition.isGujrati ? "ચિત્ર ઓળખો" : "Guess The Image")),
        scrabble: filteredLeagues.find(league => league.leagueName === (whereCondition.isGujrati ? "સ્ક્રેબલ" : "Scrabble")),
        wordSearch: filteredLeagues.find(league => league.leagueName === (whereCondition.isGujrati ? "શબ્દ શોધો" : "Word Search")),
        quizzes: quizzes,
    };

    return result;
});

export default { fetchLeagues };;