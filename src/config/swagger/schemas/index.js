import commonSchemas from "./common.js";
import userSchemas from "./user.js";
import adminSchemas from "./admin.js";
import adsSchemas from "./ads.js";
import legalSchemas from "./legal.js";
import quizSchemas from "./quiz.js";
import wordSearchSchemas from "./wordSearch.js";
import matchSchemas from "./match.js";
import guessTheImageSchemas from "./guessTheImage.js";
import guessTheWordSchemas from "./guessTheWord.js";
import playSchemas from "./play.js";

const schemas = {
  ...commonSchemas,
  ...userSchemas,
  ...adminSchemas,
  ...adsSchemas,
  ...legalSchemas,
  ...quizSchemas,
  ...wordSearchSchemas,
  ...matchSchemas,
  ...guessTheImageSchemas,
  ...guessTheWordSchemas,
  ...playSchemas
};

export default schemas;
