import { authOption } from "@/app/api/auth/[...nextauth]/options";
import connectDB from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";

export const GET = async (req: Request) => {
  try {
    await connectDB();

    const session = await getServerSession(authOption);
    const user = session?.user;

    console.log("here, session: ", session);
    console.log("here, user: ", user);

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

    const userId = new mongoose.Types.ObjectId(user._id);
    console.log("here, userId: ", userId);

    // mongo db aggregation pipleing
    const aggregationPipeline = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]);

    console.log("here, aggregationPipeline: ", aggregationPipeline);

    if (!aggregationPipeline || !aggregationPipeline.length) {
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

    return Response.json(
      {
        success: true,
        messages: aggregationPipeline[0].messages,
      },
      {
        status: StatusCodes.OK,
      }
    );
  } catch (err) {
    console.error("Error getting Messages", err);

    return Response.json(
      {
        success: false,
        message: "Error getting Messages",
      },
      {
        status: StatusCodes.INTERNAL_SERVER_ERROR,
      }
    );
  }
};
