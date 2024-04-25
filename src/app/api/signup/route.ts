import connectDB from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import sendVerificationEmail from "@/helpers/sendVerificationEmail";
import { StatusCodes } from "http-status-codes";

const POST = async (req: Request) => {
  await connectDB();

  try {
    const { username, email, password } = await req.json();

    const isExistingUsernameAndVerified = await UserModel.findOne({
      username,
      isUserVerified: true,
    });

    if (isExistingUsernameAndVerified) {
      return Response.json(
        {
          success: false,
          message: "Username already exists",
        },
        {
          status: StatusCodes.BAD_REQUEST,
        }
      );
    }

    const isExistingEmail = await UserModel.findOne({ email });
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const verificationCodeExpDate = new Date();
    verificationCodeExpDate.setHours(verificationCodeExpDate.getHours() + 1);

    if (isExistingEmail) {
      if (isExistingEmail.isUserVerified) {
        return Response.json(
          {
            success: false,
            message: "Email already exists",
          },
          {
            status: StatusCodes.BAD_REQUEST,
          }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);

        isExistingEmail.password = hashedPassword;
        isExistingEmail.verificationCode = verificationCode;
        isExistingEmail.verificationCodeExpiry = verificationCodeExpDate;

        await isExistingEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new UserModel({
        username,
        password: hashedPassword,
        email,
        verificationCode,
        verificationCodeExpiry: verificationCodeExpDate,
      });
      await newUser.save();
    }

    // sending verification email
    const emailResponse = await sendVerificationEmail(
      username,
      email,
      verificationCode
    );

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: StatusCodes.INTERNAL_SERVER_ERROR }
      );
    }

    Response.json(
      {
        success: true,
        message: "User registered successfully. Please verify your email",
      },
      { status: StatusCodes.CREATED }
    );
  } catch (err: any) {
    console.error("Error registering user", err);

    return Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      }
    );
  }
};

export default POST;
