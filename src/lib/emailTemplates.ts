import crypto from "crypto";
const resetToken = crypto.randomBytes(32).toString("hex");
const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

export const createVerificationEmailTemplate = (
  name: string,
  verificationLink: string,
  logoUrl: string = "https://cdn-ilajomb.nitrocdn.com/gWJKpISSLBBlydPBhhjanjBqpwDoDDew/assets/images/optimized/rev-4f4120a/council.science/wp-content/uploads/2023/03/image-6.png"
)=>
        