import connectDB from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { usernameValidation } from "@/schemas/signupSchema";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export const GET = async (req: Request) => {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);

    const queryParam = {
      username: searchParams.get("username"),
    };

    const validationRes = UsernameQuerySchema.safeParse(queryParam);
    // console.log("validationRes: ", validationRes);

    if (!validationRes.success) {
      const usernameErrors =
        validationRes.error.format().username?._errors || [];

      return Response.json(
        {
          success: false,
          message: usernameErrors.length
            ? usernameErrors.join(", ")
            : "Invalid query parameter",
        },
        {
          status: StatusCodes.BAD_REQUEST,
        }
      );
    }

    const { username } = validationRes.data;
    const isUsernameExists = await UserModel.findOne({
      username,
      isUserVerified: true,
    });

    if (isUsernameExists) {
      return Response.json(
        {
          success: false,
          message: "Username already taken",
        },
        {
          status: StatusCodes.BAD_REQUEST,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Username is available",
      },
      {
        status: StatusCodes.OK,
      }
    );
  } catch (err) {
    console.error("Error checking username", err);

    return Response.json(
      {
        success: false,
        message: "Error checking username",
      },
      {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      }
    );
  }
};
