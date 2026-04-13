import db from "../../config/db.js";
import ErrorResponse from "../../utlis/ErrorResponse.js";
import asyncHandler from "../../middleware/async.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import logger from "../../utlis/logger.js";
import auth from "../../middleware/authToken.js";
import nodemailer from "nodemailer";
import { getCountryCode } from "../../utlis/country_code.js";
import { sendContactusEmail, sendForgotPasswordOtp, sendWelcomeMail } from "../../utlis/mailer.js";

const generateRandomPassword = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // Generates a random 4-digit number
};
const transporter = nodemailer.createTransport({
  host: 'azadar.media', 
  port: 25, 
  auth: {
      user: 'zawwar@azadar.media', 
      pass: '1234567890', 
  },
  tls: {
      rejectUnauthorized: false
  }
});

const generateNumericOTP = () => {
  let otp = Math.floor(1000 + (Math.random()) * 9000)
  return otp;
};

const sendOTP = asyncHandler(async (email, otp) => {
  const mailOptions = {
      from: 'zawwar@azadar.media',
      to: email,
      subject: 'OTP Verification',
      text: `Your OTP for password reset is: ${otp}`,
      html: `<p>Your OTP for verification is: <strong>${otp}</strong></p>`, 
  };
 const t = await transporter.sendMail(mailOptions);
 console.log(t)
 return  "otp sent"
});

function getDateRange(type) {
    const now = new Date();
    let startDate, endDate;

    switch (type) {
        case 'weekly':
            startDate = new Date();
            startDate.setDate(startDate.getDate() - startDate.getDay()); 
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6); 
            endDate.setHours(23, 59, 59, 999); 
            break;

        case 'monthly':
            // Start of the current month
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            startDate.setHours(0, 0, 0, 0); // Set to start of the day
            
            // End of the current month
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endDate.setHours(23, 59, 59, 999); // Set to end of the day
            break;

        case 'yearly':
        default:
            // Start of the current year
            startDate = new Date(now.getFullYear(), 0, 1);
            startDate.setHours(0, 0, 0, 0); // Set to start of the day
            
            // End of the current year
            endDate = new Date(now.getFullYear(), 11, 31);
            endDate.setHours(23, 59, 59, 999); // Set to end of the day
            break;
    }

    return { startDate, endDate };
}


const login = asyncHandler(async (body) => {
  const {email, password,fcmToken}= body 
  logger.info('login')
  	console.log(body)
    const user = await db.user.findOne({ where: { userEmail: email } });
    if (!user) {
      throw new ErrorResponse('user not found', 401);
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ErrorResponse('Invalid credentials', 401);
    }
    const tokenPayload = {
      userId: user.userId,
      userName: user.userName,
      userEmail: user.userEmail,
      userType: user.userType
    };
    const token = auth.generateToken(tokenPayload);
    if(fcmToken){
      user.fcm = fcmToken;
      await user.save()
    }
  
  	  const countryCode = user.phoneNo ? getCountryCode(user.phoneNo): null;
      const cleanedPhoneNumber = user.phoneNo ? user.phoneNo.replace(new RegExp(`^${countryCode}`), '') : null;
  
      return {
      token,
      userId: user.userId,
      userName: user.userName,
      userEmail: user.userEmail,
      profile_avatar: user.profile_avatar,
      points: user.points,
      phoneNo: cleanedPhoneNumber || null,
      tag: user.tag,
      countryCode: countryCode,
      userType: user.userType,
      dob:user.dob
    }
});


const signup = asyncHandler(async (body) => {
  const { userName, userEmail, password, confirmPassword } = body;
  logger.info('signup')
	logger.info(JSON.stringify(body));
  if(!userName || !userEmail || !password || !confirmPassword)
  {
    throw new ErrorResponse("userName, userEmail,password,confirmPassword is required",400)
  }

  if(password !== confirmPassword){
    throw new ErrorResponse("Confirm password and password must be same",400)
  }

  const existingUser = await db.user.findOne({ where: { userEmail } });
  if (existingUser) {
      throw new ErrorResponse('User already exists', 400);
  }

  const newUser = await db.user.create({
      userName,
      userEmail,
      password,
      points: 0,
      current_rank: null,
      tag: 'Beginner',
      isVerified: false,
      userType:"user",
  });

  const { password: _, updatedAt: __, createdAt: ___, ...userData } = newUser.toJSON();
  
      try {
        // const emailResponse = await sendWelcomeMail(userEmail, userName);
        
        // console.log('Welcome email sent:', emailResponse);
      } catch (error) {
        console.error('Error sending welcome email:', error);
        throw new ErrorResponse('Error sending welcome email, please try again later', 500);
      }
  return userData;
});

const verifyAdmin = asyncHandler(async(userId)=>{
 const existingUser = await db.user.findOne({where:{userId},
   attributes:['userId','userName','userEmail','profile_avatar','phoneNo','userType','dob']
 })
 if(!existingUser){
   throw new ErrorResponse("User dose not exist",404);
 }
 return existingUser    
})



const socialLogin = asyncHandler(async (body, fcmToken) => {
 logger.info('social login')
 logger.info(JSON.stringify(body));
 const { user } = body;
 const { email, name, id } = user;

 let existing_user = await db.user.findOne({
   where: {
     socialLoginId: id
   }
 });

 if (!existing_user && email) {
   existing_user = await db.user.findOne({
     where: {
       userEmail: email
     }
   });
 }

 if (!existing_user) {
   const randomPassword = generateRandomPassword();
   existing_user = await db.user.create({
     userName: name,
     userEmail: email,
     password: randomPassword,
     points: 0,
     current_rank: null,
     tag: 'Beginner',
     isVerified: false,
     socialLoginId: id,
     userType: 'user',
     dob: null,
     fcm: fcmToken,
     socialLoginType: 'Google'
   });

   try {
     await sendWelcomeMail(email, name);
     logger.info('Welcome email sent successfully');
   } catch (error) {
     logger.error('Error sending welcome email:', error);
   }

   const tokenPayload = {
     userId: existing_user.userId,
     userName: existing_user.userName,
     userEmail: existing_user.userEmail,
     userType: existing_user.userType
   };
   const token = auth.generateToken(tokenPayload);
   const { password: _, updatedAt: __, createdAt: ___, ...userData } = existing_user.toJSON();



   const formatData = {
     userId: existing_user.userId,
     userName: existing_user.userName,
     userEmail: existing_user.userEmail,
     profile_avatar: existing_user.profile_avatar,
     points: existing_user.points,
     tag: existing_user.tag,
     dob: existing_user.dob,
     countryCode: getCountryCode(existing_user.phoneNo),
     userType: existing_user.userType,
     phoneNo: existing_user.phoneNo ? existing_user.phoneNo.replace(new RegExp(`^${getCountryCode(existing_user.phoneNo)}`), '') : null
   }

   return {
     token,
     formatData
   };
 } else {
   const shouldSave =
     existing_user.socialLoginId !== id ||
     existing_user.socialLoginType !== 'Google' ||
     existing_user.fcm !== fcmToken;

   existing_user.socialLoginId = id;
   existing_user.socialLoginType = 'Google';
   existing_user.fcm = fcmToken;

   if (!existing_user.userName && name) {
     existing_user.userName = name;
   }

   if (shouldSave) {
     await existing_user.save();
   }

   const tokenPayload = {
     userId: existing_user.userId,
     userName: existing_user.userName,
     userEmail: existing_user.userEmail,
     userType: existing_user.userType
   };
   const token = auth.generateToken(tokenPayload);
   let countryCode = '91'; 
   let cleanedPhoneNumber = null; 
   if (existing_user.phoneNo) {
     countryCode = getCountryCode(existing_user.phoneNo);
     cleanedPhoneNumber = existing_user.phoneNo.replace(new RegExp(`^${countryCode}`), '');
   }

   return {
     token,
     userId: existing_user.userId,
     userName: existing_user.userName,
     userEmail: existing_user.userEmail,
     profile_avatar: existing_user.profile_avatar,
     points: existing_user.points,
     tag: existing_user.tag,
     dob: existing_user.dob,
     countryCode: countryCode,
     userType: existing_user.userType,
     phoneNo: cleanedPhoneNumber
   };
 }
});

const forgotUserPassword = asyncHandler(async (query) => {
  const { email } = query;
  if (!email) {
    throw new ErrorResponse('Email is required to reset password', 400);
  }

  const existingUser = await db.user.findOne({ where: { userEmail: email } });
  if (!existingUser) {
    throw new ErrorResponse('User does not exist', 404);
  }

  if (existingUser.type === 'admin') {
    throw new ErrorResponse('Admin password cannot be reset by a user', 403);
  }
  
  const otp = generateNumericOTP();
  const expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getMinutes() + 15);

  // Check if an OTP record exists for this email
  const existingOTP = await db.userOtp.findOne({ where: { email } });

  if (existingOTP) {
    // Update existing OTP record
    await existingOTP.update({ otp, expiryTime });
  } else {
    // Create new OTP record
    await db.userOtp.create({ email, otp, expiryTime });
  }



  try {
    const emailResponse = await sendForgotPasswordOtp(otp,email)
    console.log('Otp sent successfully', emailResponse);
    return [];
  } catch (error) {
    console.error('Error sending email:', error);
    throw new ErrorResponse('Error sending email, please try again later', 500);
  }
});


const verifyOTP = asyncHandler(async (body) => {

  const {email,otp} = body;

  try {
    if(!email || !otp){
      throw new ErrorResponse('Email and otp required', 400)
    }

    const userOtp = await db.userOtp.findOne(
      {
        where:{
          email,
          otp
        }
      },
    );

    if(!userOtp){
      throw new ErrorResponse('otp mismatch',401)
    }

    const now = new Date();
    const expiryTime = new Date(userOtp.expiryTime);

    if(expiryTime <  now){
      throw new ErrorResponse('Otp expired please try again', 401);
    };

    userOtp.destroy();

    return []

  } catch (error) {
    console.error('Error verifying otp:', error);
    throw new ErrorResponse('Error verifying otp, please try again later', 500);
  }
})

const changePassword = asyncHandler(async(body)=>{
  const {email,otp,password} = body;
  if(!otp || !password || !email){
      throw new ErrorResponse("email otp and password is required");
  }
  const valid_otp = await db.userOtp.findOne({where:{email}});
  const user = await db.user.findOne({where:{userEmail:email}})
  if(!user){
      throw new ErrorResponse("user not exist")
  }
  if(!valid_otp){
      throw new ErrorResponse("user not exist")
  }
  if(otp != valid_otp.otp){
      throw new ErrorResponse("OTP is invalid")
  }
  if (new Date() > valid_otp.expiryTime) {
      throw new ErrorResponse("OTP has expired", 404);
  }
  user.password = password;
  await user.save();
  return []
});

const deleteUser = asyncHandler(async (query) => {
  console.log(query)
  const { userId } = query;
  const transaction = await db.sequelize.transaction();
  try {
      const user = await db.user.findOne({ where: { userId }, transaction });
      if (!user) {
          throw new ErrorResponse('User not found', 404);
      }
      if (user.userType === 'admin' || user.userType === 'editor') {
          throw new ErrorResponse('Admin or editor cannot be deleted', 400);
      }
      const useremail = user.userEmail;
      await db.userOtp.destroy({ where: { email:useremail }, transaction });

      const answerExists = await db.answer.findOne({ where: { userId }, transaction });
      if (answerExists) await db.answer.destroy({ where: { userId }, transaction });

      const gameAnswerExists = await db.gameAnswer.findOne({ where: { userId }, transaction });
      if (gameAnswerExists) await db.gameAnswer.destroy({ where: { userId }, transaction });

      const progressExists = await db.progress.findOne({ where: { userId }, transaction });
      if (progressExists) await db.progress.destroy({ where: { userId }, transaction });

      const pointsExists = await db.points.findOne({ where: { userId }, transaction });
      if (pointsExists) await db.points.destroy({ where: { userId }, transaction });

      const activityExists = await db.activity.findOne({ where: { userId }, transaction });
      if (activityExists) await db.activity.destroy({ where: { userId }, transaction });

      await user.destroy({ transaction });

      await transaction.commit();

      return [];
  } catch (error) {
      await transaction.rollback();
      throw error;
  }
});

const contactUs = asyncHandler(async (body) => {
  const { name, email, subject, message } = body;
  console.log(name, email, subject, message);

  if (!name || !email || !subject || !message) {
      throw new ErrorResponse("All fields are required", 404);
  };

  try {
  
    const result = await sendContactusEmail(name, email, subject, message )
      console.log(result)
      return []
  } catch (error) {
      console.log('Error sending emails:', error);
      throw new ErrorResponse('Error sending email, please try again later', 500);
  }
});
const fetchUserCorrectQuestions = asyncHandler(async (query) => {
  const {userId} = query;
  if(!userId){
    throw new ErrorResponse("UserID is required")
  }
  const correct_answers = await db.answer.findAll({
    where: { userId, isCorrect: true }, 
    attributes: ['questionId'],
  });

  console.log(correct_answers)
  if (correct_answers.length === 0) {
    return [];
  }

  const questionIds = correct_answers.map(answer => answer.questionId);

  const questions = await db.question.findAll({
    where: {
      questionId: questionIds,
    },
    attributes: ['questionId', 'question', 'correct_Answer', 'type', 'time', 'ageLimit', 'questionImage'], // Define the fields you want to retrieve
  });

  const result = correct_answers.map(answer => {
    const question = questions.find(q => q.questionId === answer.questionId);
    return {
      questionId: question.questionId,
      question: question.question,
      correctAnswer: question.correct_Answer,
      type: question.type,
      language: question.language,
      time: question.time,
      ageLimit: question.ageLimit,
      questionImage: question.questionImage,
    };
  });
  return result;
});

const fetchGuessTheImageDetails = asyncHandler(async (query) => {
  const { userId, lang } = query;
  if(!userId || !lang){
    throw new ErrorResponse("userId and lang is required",400)
  }
  if (!['en', 'guj'].includes(lang.toLowerCase())) {
      throw new ErrorResponse("Invalid language parameter. Choose either 'en' or 'guj'.", 400);
  }

  const isGujrati = lang.toLowerCase() === 'guj';

  const totalGuessTheImageGames = await db.guessWord.count({
      where: { isGujrati }
  });

  const completedGameIds = await db.gameAnswer.findAll({
      attributes: ['gameId'],
      where: {
          userId,
          isCorrect: true,
          Type: 'Guess-the-image' 
      },
      group: ['gameId'],
      raw: true
  });

  const completedGamesCount = completedGameIds.length;
  const remainingGames = totalGuessTheImageGames - completedGamesCount;
  const totalUsers = await db.user.count();

  return {
      levels:remainingGames,
      totalUsers
  };
});

const appleLogin = asyncHandler(async (body) => {
  const { jwtToken, fcmToken, name } = body; // Destructure 'name' from body
  logger.info('Apple login');
  logger.info(jwtToken);
  let decodedToken;
  try {
    const payload = jwtToken.split('.')[1]; // Get the payload part
    const decodedPayload = Buffer.from(payload, 'base64').toString('utf8'); // Decode base64
    decodedToken = JSON.parse(decodedPayload); // Parse JSON to get the token payload
  } catch (error) {
    logger.error('Error decoding JWT token:', error);
    throw new Error('Invalid token');
  }
  const { email, sub: id } = decodedToken;

  let existing_user = await db.user.findOne({
    where: {
      socialLoginId: id,
    },
  });

  if (!existing_user) {
    const randomPassword = generateRandomPassword();
    const userName = name || email.split('@')[0]; // Use 'name' if present, otherwise split email
    console.log(userName)
    existing_user = await db.user.create({
      userName: userName,
      userEmail: email,
      password: randomPassword,
      points: 0,
      current_rank: null,
      tag: 'Beginner',
      isVerified: true,
      socialLoginId: id,
      type: 'user',
      dob: null,
      fcm: fcmToken,
      socialLoginType: 'Apple',
    });

    try {
      await sendWelcomeEmail(userName, email);
      logger.info('Welcome email sent successfully');
    } catch (error) {
      logger.error('Error sending welcome email:', error);
    }

    const tokenPayload = {
      userId: existing_user.userId,
      userName: existing_user.userName,
      userEmail: existing_user.userEmail,
      userType: existing_user.userType,
    };
    const token = auth.generateToken(tokenPayload);
    const { password: _, updatedAt: __, createdAt: ___, ...userData } = existing_user.toJSON();

    return {
      token,
      ...userData,
    };
  } else {
    await db.user.update(
      { fcm: fcmToken },
      { where: { socialLoginId: id } }
    );

    const tokenPayload = {
      userId: existing_user.userId,
      userName: existing_user.userName,
      userEmail: existing_user.userEmail,
      userType: existing_user.userType,
    };
    const token = auth.generateToken(tokenPayload);
    let countryCode = "91";
    if (existing_user.phoneNo) {
      countryCode = getCountryCode(existing_user.phoneNo);
    }
    const cleanedPhoneNumber = existing_user.phoneNo?.replace(new RegExp(`^${countryCode}`), '');

    return {
      token,
      userId: existing_user.userId,
      userName: existing_user.userName,
      userEmail: existing_user.userEmail,
      profile_avatar: existing_user.profile_avatar,
      points: existing_user.points,
      tag: existing_user.tag,
      dob: existing_user.dob,
      countryCode: countryCode,
      userType: existing_user.userType,
      phoneNo: cleanedPhoneNumber,
    };
  }
});

const reviewedGiven = asyncHandler(async (body) => {
  const { userId } = body;
  if (!userId) {
    throw new ErrorResponse("UserID is required", 400);
  }
  const existing_user = await db.user.findOne({ where: { userId } });
  if(!existing_user){
    throw new ErrorResponse("User not found", 404)  
  }
  const existingReview = await db.reviewed.findOne({ where: { userId } });
  if (existingReview) {
    throw new ErrorResponse("Review already exists for this user", 409);
  }
  const reviewed = await db.reviewed.create({
    userId,
    isReviewed: true,
  });

  return reviewed;
});

const getreviewDetails = asyncHandler(async (query) => {
  const { userId } = query;
  if (!userId) {
    throw new ErrorResponse("UserID is required", 400);
  }
  const existing_user = await db.user.findOne({ where: { userId } });
  if(!existing_user){
    throw new ErrorResponse("User not found", 404)  
  }
  const review = await db.reviewed.findOne({ where: { userId } });
  if (!review) {
    return {
      isReviewed: false,
    };
  }

  return {
    isReviewed: true,
  };
});



export default {
   getreviewDetails,
   reviewedGiven,
   appleLogin,
   fetchGuessTheImageDetails,
   fetchUserCorrectQuestions,
   changePassword,
   forgotUserPassword,
   socialLogin,
   verifyOTP,
   login,
   signup,
   verifyAdmin,
   deleteUser,
   contactUs
};;
