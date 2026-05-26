import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";

export async function getSessionServer() {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    let token = "";

    // 1. Try Secure chunked cookies first
    const secureChunks = allCookies.filter(c => c.name.startsWith("__Secure-next-auth.session-token"));
    if (secureChunks.length > 0) {
      secureChunks.sort((a, b) => {
        const aNum = a.name.split(".").pop();
        const bNum = b.name.split(".").pop();
        const aInt = parseInt(aNum || "-1", 10);
        const bInt = parseInt(bNum || "-1", 10);
        return (isNaN(aInt) ? -1 : aInt) - (isNaN(bInt) ? -1 : bInt);
      });
      token = secureChunks.map(c => c.value).join("");
    }

    // 2. Fallback to non-secure chunked cookies
    if (!token) {
      const nonSecureChunks = allCookies.filter(c => c.name.startsWith("next-auth.session-token"));
      if (nonSecureChunks.length > 0) {
        nonSecureChunks.sort((a, b) => {
          const aNum = a.name.split(".").pop();
          const bNum = b.name.split(".").pop();
          const aInt = parseInt(aNum || "-1", 10);
          const bInt = parseInt(bNum || "-1", 10);
          return (isNaN(aInt) ? -1 : aInt) - (isNaN(bInt) ? -1 : bInt);
        });
        token = nonSecureChunks.map(c => c.value).join("");
      }
    }

    if (!token) return null;
    
    const decoded = await decode({
      token,
      secret: process.env.NEXTAUTH_SECRET!,
    });
    
    if (!decoded) return null;
    
    return {
      user: {
        id: decoded.id as string,
        name: decoded.name as string,
        email: decoded.email as string,
        role: decoded.role as "admin" | "user",
        labName: decoded.labName as string,
        labLogo: decoded.labLogo as string,
        signature: decoded.signature as string,
      }
    };
  } catch (error) {
    console.error("Error in getSessionServer:", error);
    return null;
  }
}
