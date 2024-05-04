import { authOption } from "@/app/api/auth/[...nextauth]/options";
import connectDB from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { acceptMessagesValidator } from "@/schemas/acceptMessageSchema";
import { StatusCodes } from "http-status-codes";
import { getServerSession } from "next-auth";

export const POST = async (req: Request) => {
  try {
    await connectDB();

    const session = await getServerSession(authOption);
    const user = session?.user;

    if (!session || !user) {
      return Response.json(
        {
          success: false,
          message: "Please login to access",
        },
        {
          status: StatusCodes.UNAUTHORIZED,
        }
      );
    }

    const validationResult = acceptMessagesValidator.safeParse(
      await req.json()
    );

    if (!validationResult.success) {
      const validationErrors = validationResult.error.errors.map(
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

    const userId = user._id;
    const { acceptMessages } = validationResult.data;

    const isUpdateUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        isAcceptingMessage: acceptMessages,
      },
      { new: true }
    );

    if (!isUpdateUser) {
      return Response.json(
        {
          success: false,
          message: "Error toggling Accept Message",
        },
        {
          status: StatusCodes.UNAUTHORIZED,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message:
          acceptMessages === true
            ? "You are now accepting messages"
            : "You are not accepting messages currently",
        updatedUser: isUpdateUser,
      },
      { status: StatusCodes.OK }
    );
  } catch (err) {
    console.error("Error toggling Accept Message", err);

    return Response.json(
      {
        success: false,
        message: "Error toggling Accept Message",
      },
      {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      }
    );
  }
};

export const GET = async (req: Request) => {
  try {
    await connectDB();

    const session = await getServerSession(authOption);
    const user = session?.user;

    if (!session || !user) {
      return Response.json(
        {
          success: false,
          message: "Please login to access",
        },
        {
          status: StatusCodes.UNAUTHORIZED,
        }
      );
    }

    const userId = user._id;

    const foundUser = await UserModel.findById(userId);

    if (!foundUser) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: StatusCodes.UNAUTHORIZED,
        }
      );
    }

    return Response.json({
      success: true,
      isAcceptingMessage: foundUser.isAcceptingMessage,
    });
  } catch (err) {
    console.error("Error getting Accept Message Status", err);

    return Response.json(
      {
        success: false,
        message: "Error getting Accept Message Status",
      },
      {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      }
    );
  }
};
