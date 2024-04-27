import { StatusCodes } from "http-status-codes";

export const GET = () => {
  return Response.json(
    {
      success: true,
      message: "API is working",
    },
    {
      status: StatusCodes.OK,
    }
  );
};
