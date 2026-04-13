import Joi from "joi";

import {
  Signup,
  loginSchema,
  createUserSchema,
  updateUserSchema,
  createQuizSchema,
  updateQuizSchema,
  createQuestionSchema,
  updateQuestionSchema,
} from "../validators/validator.js";

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ errors: error.details.map(err => err.message) });
  }
  next();
};

export default {
  validateSignup: validate(Signup),
  validateLogin: validate(loginSchema),
  validateCreateUser: validate(createUserSchema),
  validateUpdateUser: validate(updateUserSchema),
  validateCreateQuiz: validate(createQuizSchema),
  validateUpdateQuiz: validate(updateQuizSchema),
  validateCreateQuestion: validate(createQuestionSchema),
  validateUpdateQuestion: validate(updateQuestionSchema)
};;
