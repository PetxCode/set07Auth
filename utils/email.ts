import { google } from "googleapis";
import { oauth2 } from "googleapis/build/src/apis/oauth2";
import nodemailer from "nodemailer";
import path from "path";
import ejs from "ejs";

const GOOGLE_ID =
  "199704572461-84filrl6gfs1cie7b5bkvspne91bbj0q.apps.googleusercontent.com";

const GOOGLE_SECRET = "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";

const GOOGLE_URL = "https://developers.google.com/oauthplayground/";

const GOOGLE_TOKEN =
  "1//04VN_6MSoOhbqCgYIARAAGAQSNwF-L9IreLEe5iU5Hd_DoUnio4gsaH3CBXozNlnoofjcBGyAVetbZSh0e2DR2rAr6TGXKCyRkgs";

const oAuth = new google.auth.OAuth2(GOOGLE_ID, GOOGLE_SECRET, GOOGLE_URL);
oAuth.setCredentials({ access_token: GOOGLE_TOKEN });

export const sendMail = async (user: any) => {
  try {
    const getAccess: any = (await oAuth.getAccessToken()).token;

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "peterotunuya2@gmail.com",
        clientId: GOOGLE_ID,
        clientSecret: GOOGLE_SECRET,
        refreshToken: GOOGLE_TOKEN,
        accessToken: getAccess,
      },
    });

    const url = `http://localhost:5566/api/v1/${user.id}/verify`;
    const choiceData = {
      userName: user.userName,
      email: user.email,
      id: user.id,
      url,
    };

    const data = path.join(__dirname, "../views/index.ejs");
    const realData = await ejs.renderFile(data, choiceData);

    const mailer = {
      from: "peterotunuya2@gmail.com",
      to: user.email,
      subject: "Congrate",
      html: realData,
    };

    transport.sendMail(mailer);
  } catch (error) {
    console.log(error);
  }
};
