import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { sendEmail } from "@/lib/workflow";
import { serve } from "@upstash/workflow/nextjs";
import { eq } from "drizzle-orm";

type InitialData = {
  email: string;
  fullName: string;
};

const ONE_DAY_IN_S = 24 * 60 * 60;

const THREE_DAYS_IN_S = 3 * ONE_DAY_IN_S;
const THIRTY_DAYS_IN_S = 30 * ONE_DAY_IN_S;

export const { POST } = serve<InitialData>(async (context) => {
  const { email, fullName } = context.requestPayload;

  // Welcome email
  await context.run("new-signup", async () => {
    await sendEmail({
      email,
      subject: "Welcome to Bookwise",
      body: `Welcome ${fullName}`,
    });
  });

  await context.sleep("wait-for-3-days", THREE_DAYS_IN_S);

  while (true) {
    const state = await context.run("check-user-state", async () => {
      return await getUserState(email);
    });

    if (state === "non-active") {
      await context.run("send-email-non-active", async () => {
        await sendEmail({
          email,
          subject: "Are you still there?",
          body: `Hey, ${fullName} We missed you!`,
        });
      });
    } else if (state === "active") {
      await context.run("send-email-active", async () => {
        await sendEmail({
          email,
          subject: "Welcome back",
          body: `Welcome back ${fullName}!`,
        });
      });
    }

    await context.sleep("wait-for-1-month", THIRTY_DAYS_IN_S);
  }
});

type UserState = "non-active" | "active";

const getUserState = async (email: string): Promise<UserState> => {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (!user?.length) return "non-active";

  const lastActivityDate = new Date(user[0].lastActivityDate!);
  const currenDate = new Date();
  const timeDiff = currenDate.getTime() - lastActivityDate.getTime();

  if (timeDiff > THREE_DAYS_IN_S && timeDiff <= THIRTY_DAYS_IN_S)
    return "non-active";
  return "active";
};
