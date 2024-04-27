import mongoose, { Schema } from "mongoose";
import { IMessage } from "./Message";

interface IUser {
  username: string;
  password: string;
  email: string;
  verificationCode: string;
  verificationCodeExpiry: Date;
  isUserVerified: boolean;

  isAcceptingMessage: boolean;

  messages: IMessage[];
}

const UserSchema: Schema<IUser> = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,
      "Please enter a valid email address",
    ],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    min: [6, "Password must be of atleast 6 characters"],
  },
  verificationCode: {
    type: String,
    required: [true, "Verification code is required"],
  },
  verificationCodeExpiry: {
    type: Date,
    required: [true, "Verification code Expiry is required"],
  },
  isUserVerified: {
    type: Boolean,
    default: false,
  },

  isAcceptingMessage: {
    type: Boolean,
    default: true,
  },
  messages: [],
});

// const UserModel = on susequent run, return already created model || on first run, create new model
const UserModel =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default UserModel;
