import { resend } from "@/lib/resend";
import { ApiResponse } from "@/types/ApiResponse";
import VerificationEmail from "../../emailTemplates/VerificationEmail";

const sendVerificationEmail = async (
  username: string,
  email: string,
  verificationCode: string
): Promise<ApiResponse> => {
  try {
    await resend.emails.send({
      from: "TrueFeed <onboarding@resend.dev>",
      to: email,
      subject: "TrueFeed | Verification Code",
      react: VerificationEmail({ username, otp: verificationCode }),
    });

    return {
      success: false,
      message: "Verification email sent successfully",
    };
  } catch (error) {
    console.log("Error sending verification email", error);

    return {
      success: false,
      message: "Failed to send verification email",
    };
  }
};

export default sendVerificationEmail;
