import connectDB from "@/lib/dbConnect";
import { IMessage } from "@/model/Message";
import UserModel from "@/model/User";
import { messageSchemaValidator } from "@/schemas/messageSchema";
import { StatusCodes } from "http-status-codes";

export const POST = async (req: Request) => {
  try {
    await connectDB();

    const validatorRes = messageSchemaValidator.safeParse(await req.json());

    if (!validatorRes.success) {
      const validationErrors = validatorRes.error.errors.map(
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

    const { username, content } = validatorRes.data;

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

    if (!user.isAcceptingMessage) {
      return Response.json(
        {
          success: false,
          message: "User not accepting messages at this moment",
        },
        {
          status: StatusCodes.FORBIDDEN,
        }
      );
    }

    const newMessage: IMessage = { content, createdAt: new Date() } as IMessage;
    user.messages.push(newMessage);
    await user.save();

    return Response.json(
      {
        success: true,
        message: "Message sent successfully",
      },
      {
        status: StatusCodes.OK,
      }
    );
  } catch (err) {
    console.error("Error sending Messages", err);

    return Response.json(
      {
        success: false,
        message: "Error sending Message",
      },
      {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      }
    );
  }
};
