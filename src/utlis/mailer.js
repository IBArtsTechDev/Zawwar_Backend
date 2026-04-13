import nodemailer from "nodemailer";
import getEnv from "../config/envReader.js";

// create transporter (configure once)
 const transporter = nodemailer.createTransport({
        host: 'mail.ibarts.in', 
        port: 465, 
        secure: true,
        auth: {
            user: getEnv.MAIL_USER,
            pass: getEnv.MAIL_PASS,
        }
})

await transporter.verify()
  .then(() => console.log("SMTP OK"))
  .catch(err => console.error("SMTP ERROR:", err));

// reusable function
export const sendWelcomeMail = async (userEmail, userName) => {

  const mailOptions = {
    from: "shahil@ibarts.in",
    to: userEmail,
    subject: "Welcome to Azadar Media!",
    html: `
      <img src="https://api.azadar.media/1727213840392.jpeg" style="max-width: 100%; height: auto;"/>
      <p>Hello ${userName}, Salaam</p>
      
      <p>This application was not created for profit; we initiated this endeavor to enhance your knowledge. Here are some key details:</p>
      <ol>
          <li>We have shared this application with 2 Zawaar.</li>
          <li>One is below 16 years old, and one is above 16 years old.
              <ul>
                  <li>For those under 16, the ticket is sponsored privately by the App Team.</li>
                  <li>For those above 16, the ticket is sponsored by App Ads funds.</li>
              </ul>
          </li>
          <li>The Zawaar list is reviewed for game points.</li>
          <li>Weekly new quizzes will be updated.</li>
          <li>Points are reset after Eid e Ghadeer.</li>
          <li>Please ensure your name and DOB match your passport.</li>
      </ol>
      
      <p><strong>Regarding Points:</strong></p>
      <ul>
          <li>Word Search: +10</li>
          <li>Guess the Image: +6 / -3</li>
          <li>Guess the Word: +6</li>
          <li>Quiz: +10 / -5</li>
          <li>Do Later: -2</li>
          <li>Full Video Views: +10</li>
      </ul>
      
      <p>For further information, please contact us!</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};

export const sendForgotPasswordOtp = async (otp,email) => {

  const mailOptions = {
    from: 'shahil@ibarts.in',
    to: email,
    subject: 'Password Reset Request',
    text: `Your OTP for password reset is: ${otp}`,
    html: `<p>Your OTP for password reset is: <strong>${otp}</strong></p>`,
  }

  return transporter.sendMail(mailOptions);
}

export const sendContactusEmail = async (name, email, subject, message) => {

    const adminEmailTemplate = `
  <div style="font-family: Arial, sans-serif;">
    <!-- Hero Section -->
    <div style="background-color: #000; color: white; text-align: center; padding: 20px;">
      <h1 style="font-size: 24px; font-weight: bold; margin: 0;">Contact Us</h1>
    </div>

      <!-- Contact Form Section -->
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f8f8; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">

      <!-- Display user information -->
      <div style="margin-bottom: 20px;">
        <label style="display: block; font-size: 14px; color: #333; margin-bottom: 5px;">Name</label>
        <div style="padding: 10px; background-color: #fff; border: 1px solid #ddd; border-radius: 4px;">${name}</div>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="display: block; font-size: 14px; color: #333; margin-bottom: 5px;">Email</label>
        <div style="padding: 10px; background-color: #fff; border: 1px solid #ddd; border-radius: 4px;">${email}</div>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="display: block; font-size: 14px; color: #333; margin-bottom: 5px;">Subject</label>
        <div style="padding: 10px; background-color: #fff; border: 1px solid #ddd; border-radius: 4px;">${subject}</div>
      </div>

      <div style="margin-bottom: 20px;">
        <label style="display: block; font-size: 14px; color: #333; margin-bottom: 5px;">Message</label>
        <div style="padding: 10px; background-color: #fff; border: 1px solid #ddd; border-radius: 4px;">${message}</div>
      </div>

    <!-- Footer -->
    <div style="background-color: #000; color: white; text-align: center; padding: 10px; margin-top: 20px;">
      <p style="margin: 0;">© All Rights Reserved.</p>
    </div>
  </div>
    `;

      const userEmailTemplate = `
      <div style="font-family: Arial, sans-serif;">
        <!-- Hero Section -->
        <div style="background-color: #000; color: white; text-align: center; padding: 20px;">
          <h1 style="font-size: 24px; font-weight: bold; margin: 0;">Contact Us</h1>
        </div>

        <!-- Contact Form Section -->
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f8f8; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <h2 style="font-size: 18px; color: #047857; font-weight: 600; text-transform: uppercase;">We Received Your Query</h2>
          <h3 style="font-size: 28px; font-weight: bold; margin-bottom: 20px;">Here is the message you sent us:</h3>

          <!-- Display user message -->
          <div style="margin-bottom: 20px;">
            <label style="display: block; font-size: 14px; color: #333; margin-bottom: 5px;">Message</label>
            <div style="padding: 10px; background-color: #fff; border: 1px solid #ddd; border-radius: 4px;">${message}</div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #000; color: white; text-align: center; padding: 10px; margin-top: 20px;">
          <p style="margin: 0;">© All Rights Reserved.</p>
        </div>
      </div>
    `;

      const mailOptionsToAdmin = {
          from: 'shahil@ibarts.in',
          to: 'zawwar@azadar.media',
          subject: `Zawwar - ${subject}`,
          html: adminEmailTemplate,
      };

        const mailOptionsToUser = {
            from: 'shahil@ibarts.in',
            to: email,
            subject: `Zawwar - ${subject}`,
            html: userEmailTemplate,
        };
        
        const t = await Promise.all([
              transporter.sendMail(mailOptionsToAdmin),
              transporter.sendMail(mailOptionsToUser)
          ]);

      return t;

}