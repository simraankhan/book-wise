"use server";

import { signIn } from "@/auth";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { ratelimit } from "../ratelimit";
import { redirect } from "next/navigation";
import { PathName } from "@/constants/path-name";
import { workflowClient } from "../workflow";
import { config } from "../config";

const signInWithCredentials = async (
  params: Pick<AuthCredentials, "email" | "password">
) => {
  const isSuccess = await checkRateLimit();
  if (!isSuccess) {
    return redirect(PathName.tooFast);
  }
  try {
    const { email, password } = params;
    const results = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (results?.error) {
      return { success: false, error: results.error };
    }
    return { success: true };
  } catch (error) {
    console.error(error, " Error in signin");
    return { success: false, error: "Error in signin" };
  }
};

const signUp = async (params: AuthCredentials) => {
  const isSuccess = await checkRateLimit();
  if (!isSuccess) {
    return redirect(PathName.tooFast);
  }
  try {
    const { email, fullName, password, universityCard, universityId } = params;
    // Check if user exists;
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser.length) {
      return { success: false, error: "User already exists" };
    }
    const hashedPassword = await hash(password, 10);
    await db.insert(users).values({
      email,
      fullName,
      password: hashedPassword,
      universityCard,
      universityId,
    });
    // Trigger worflow
    await workflowClient.trigger({
      url: `${config.env.prodEndpoint}/api/workflow/onboarding`,
      body: {
        email,
        fullName,
      },
    });
    await signInWithCredentials({ email, password });
    return { success: true };
  } catch (error) {
    console.error(error, " Error in signup");
    return { success: false, error: "Error in signup" };
  }
};

const checkRateLimit = () =>
  new Promise<boolean>(async (resolve) => {
    try {
      const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
      const { success } = await ratelimit.limit(ip);
      resolve(success);
    } catch (error) {
      console.error("Rate limit error: ", error);
      resolve(false);
    }
  });

export { signUp, signInWithCredentials };
