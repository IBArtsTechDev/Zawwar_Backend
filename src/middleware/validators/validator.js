import Joi from "joi";

const Signup = Joi.object({
  userName: Joi.string().min(3).max(30).required(),
  userEmail: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  type: Joi.string().valid('user', 'admin').required(),
  phone: Joi.string().pattern(/^[0-9]+$/).min(10).max(15).required(), // Example: only digits allowed
  dob: Joi.date().less('now').required() // Example: date of birth, should be a valid date before today
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    fcmToken: Joi.string()
});

const createUserSchema = Joi.object({
    userName: Joi.string().min(3).max(30).required(),
    userEmail: Joi.string().email().required(),
    password: Joi.string().min(6) ,
    profile_avatar: Joi.string().allow(null),
    phoneNo: Joi.string().allow(null),
    points: Joi.number().integer().min(0).default(0),
    current_rank: Joi.string().valid('Beginner', 'Intermediate', 'Expert').allow(null),
    tag: Joi.string().valid('Beginner', 'Intermediate', 'Expert').allow(null),
    isVerified: Joi.boolean().default(false),
    userType: Joi.string().valid('user', 'admin').required(),
    badges: Joi.array().items(Joi.object({
    })).allow(null),
  }).or('userName', 'userEmail', 'userType');

const updateUserSchema = Joi.object({
    userId: Joi.number().integer(),
    userName: Joi.string().min(3).max(30),
    userEmail: Joi.string().email(),
    password: Joi.string().min(6),
    profile_avatar: Joi.string().allow(null),
    phoneNo: Joi.string().pattern(/^\d{10}$/).allow(null),
    points: Joi.number().integer().min(0),
    current_rank: Joi.string().valid('Beginner', 'Intermediate', 'Expert').allow(null),
    tag: Joi.string().valid('Beginner', 'Intermediate', 'Expert').allow(null),
    isVerified: Joi.boolean(),
    userType: Joi.string().valid('user', 'admin'),
    badges: Joi.array().items(Joi.object({
    })).allow(null),
  })

const createQuizSchema = Joi.object({
  quizName: Joi.string().min(3).max(100),
  isGujrati: Joi.boolean().allow(null),
  quizImage: Joi.string().allow(null),
});

const updateQuizSchema = Joi.object({
  quizName: Joi.string().min(3).max(100),
  isGujrati: Joi.boolean().allow(null),
  quizImage: Joi.string().allow(null),
}).or('quizName', 'isGujrati', 'quizImage');

const createQuestionSchema = Joi.object({
  quizId: Joi.number().integer().required(),
  question: Joi.string().min(3).max(255).required(),
  options: Joi.array()
    .items(
      Joi.string().min(1).max(255),
      Joi.string().min(1).max(255),
      Joi.string().min(1).max(255).allow(null, ''),
      Joi.string().min(1).max(255).allow(null, '')
    )
    .min(2)
    .max(4)
    .required(),
  correct_Answer: Joi.string().valid('A', 'B', 'C', 'D').required(),
  time: Joi.number().integer().min(0).required(),
  type: Joi.string().valid('options','boolean').required(),
  questionImage: Joi.optional(),
  imagePreview: Joi.string().optional(),
});

const updateQuestionSchema = Joi.object({
  quizId: Joi.number().integer().allow(null),
  question: Joi.string().min(3).max(255).allow(null),
  options: Joi.array()
    .items(
      Joi.string().min(1).max(255),
      Joi.string().min(1).max(255),
      Joi.string().min(1).max(255).allow(null, ''),
      Joi.string().min(1).max(255).allow(null, '')
    )
    .min(2)
    .max(4)
    .allow(null),
  correct_Answer: Joi.string().valid('A', 'B', 'C', 'D').allow(null),
  time: Joi.number().integer().min(0).allow(null),
  type: Joi.string().valid('options','boolean').required(),
  questionImage:Joi.optional(),
}).or('quizId', 'question', 'options', 'correct_Answer', 'time');


export {
  Signup,
  loginSchema,
  createUserSchema,
  updateUserSchema,
  createQuizSchema,
  updateQuizSchema,
  createQuestionSchema,
  updateQuestionSchema
};;

