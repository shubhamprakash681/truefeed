import connectDB from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { verifySchemaValidator } from "@/schemas/verifySchema";
import { StatusCodes } from "http-status-codes";

export const POST = async (req: Request) => {
  try {
    await connectDB();

    const { username, verificationCode } = await req.json();

    const validationRes = verifySchemaValidator.safeParse({
      username,
      verificationCode,
    });

    // console.log("validationRes: ", validationRes);

    if (!validationRes.success) {
      const validationErrors = validationRes.error.errors.map(
        (err) => err.message
      );

      return Response.json(
        {
          success: false,
          message: validationErrors.length
            ? validationErrors.join(", ")
            : "Invalid query parameter",
        },
        {
          status: StatusCodes.BAD_REQUEST,
        }
      );
    }

    const user = await UserModel.findOne({ username });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: StatusCodes.BAD_REQUEST,
        }
      );
    }

    const isCodeValid = user.verificationCode === verificationCode;
    const isCodeExpired =
      new Date(Date.now()) > new Date(user.verificationCodeExpiry);

    if (!isCodeValid || isCodeExpired) {
      return Response.json(
        {
          success: false,
          message:
            "Verification code is either Invalid or Expired! Please signup again to get a new code.",
        },
        {
          status: StatusCodes.BAD_REQUEST,
        }
      );
    }

    user.isUserVerified = true;
    await user.save();
    return Response.json(
      {
        success: true,
        message: "Account verification successful",
      },
      {
        status: StatusCodes.OK,
      }
    );
  } catch (err) {
    console.error("Error verifying user", err);

    return Response.json(
      {
        success: false,
        message: "Error verifying user",
      },
      {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      }
    );
  }
};
