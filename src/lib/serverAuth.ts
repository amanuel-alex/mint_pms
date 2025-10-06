import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

const SECRET = process.env.NEXTAUTH_SECRET || "your-secret";

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    return verify(token, SECRET) as {
      id: string;
      email: string;
      role: string;
      name: string;
    };
  } catch (err) {
    console.error("Auth error:", err);
    return null;
  }
}

export { SECRET }; 