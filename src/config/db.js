import { Sequelize } from "sequelize";
import getEnv from "./envReader.js";

// Import all models
import matchModel from "../model/match.js";
import matchTranslationModel from "../model/matchTranslation.js";
import userModel from "../model/user.js";
import quizModel from "../model/quiz.js";
import reviewModel from "../model/review.js";
import questionModel from "../model/question.js";
import progressModel from "../model/progress.js";
import gameActivityModel from "../model/gameActivity.js";
import guessImageModel from "../model/guessTheImage.js";
import guessWordsModel from "../model/guessTheWords.js";
import weeklyWinnerModel from "../model/weeklyWinner.js";
import resultModel from "../model/Results.js";
import answerModel from "../model/quizAnswers.js";
import badgesModel from "../model/badges.js";
import pointsModel from "../model/points.js";
import guessImageTranslationModel from "../model/guessTheImageTranslation.js";
import guessWordsTranslationModel from "../model/guessthewordstranslation.js";
import gameAnswerModel from "../model/gameAnswer.js";
import adsModel from "../model/ads.js";
import termsModel from "../model/terms.js";
import privacyModel from "../model/privacy.js";
import searchModel from "../model/wordSearch.js";
import userOtpModel from "../model/userOTP.js";
import notificationModel from "../model/notification.js";
import versionModel from "../model/versiona.js";
import imageModel from "../model/image.js";
import quizTranslationModel from "../model/QuizTranslation.js";
import questionTranslationModel from "../model/QuestionTranslation.js";
import searchTranslationModel from "../model/SearchTranslation.js";
import feedbackModel from "../model/feedback.js";

const db = {};

export default db;
export { initialize };

await initialize();

async function initialize() {
  const sequelize = new Sequelize(
    getEnv.DB_NAME,
    getEnv.DB_USERNAME,
    getEnv.DB_PASSWORD,
    {
      host: getEnv.DB_HOST,
      dialect: getEnv.DB_DIALECT,
      logging: false
    }
  );

  await sequelize.authenticate();
  console.log("Connection has been established successfully.");

  // Initialize models
  db.match = matchModel(sequelize, Sequelize);
  db.matchTranslation = matchTranslationModel(sequelize, Sequelize);
  db.user = userModel(sequelize, Sequelize);
  db.quiz = quizModel(sequelize, Sequelize);
  db.reviewed = reviewModel(sequelize, Sequelize);
  db.question = questionModel(sequelize, Sequelize);
  db.progress = progressModel(sequelize, Sequelize);
  db.activity = gameActivityModel(sequelize, Sequelize);
  db.guessWord = guessImageModel(sequelize, Sequelize);
  db.guessthewords = guessWordsModel(sequelize, Sequelize);
  db.weeklyWinner = weeklyWinnerModel(sequelize, Sequelize);
  db.result = resultModel(sequelize, Sequelize);
  db.answer = answerModel(sequelize, Sequelize);
  db.badges = badgesModel(sequelize, Sequelize);
  db.points = pointsModel(sequelize, Sequelize);
  db.guessWordTranslation = guessImageTranslationModel(sequelize, Sequelize);
  db.GuessTheWordTranslation = guessWordsTranslationModel(sequelize, Sequelize);
  db.gameAnswer = gameAnswerModel(sequelize, Sequelize);
  db.ads = adsModel(sequelize, Sequelize);
  db.terms = termsModel(sequelize, Sequelize);
  db.privacy = privacyModel(sequelize, Sequelize);
  db.Search = searchModel(sequelize, Sequelize);
  db.userOtp = userOtpModel(sequelize, Sequelize);
  db.notification = notificationModel(sequelize, Sequelize);
  db.version = versionModel(sequelize, Sequelize);
  db.image = imageModel(sequelize, Sequelize);
  db.quizTrans = quizTranslationModel(sequelize, Sequelize);
  db.QuestionTranslation = questionTranslationModel(sequelize, Sequelize);
  db.SearchTranslation = searchTranslationModel(sequelize, Sequelize);
  db.feedback = feedbackModel(sequelize, Sequelize);

  // Associations
  db.question.associate?.(db);
  db.quizTrans.associate?.(db);
  db.quiz.associate?.(db);
  db.QuestionTranslation.associate?.(db);

  db.sequelize = sequelize;

  // await sequelize.sync({ alter: true });
}