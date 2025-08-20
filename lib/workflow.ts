import { Client as WorkflowClient } from "@upstash/workflow";
import { Client as QStashClient, resend } from "@upstash/qstash";
import { config } from "./config";

const workflowClient = new WorkflowClient({
  baseUrl: config.env.upstash.qStashUrl,
  token: config.env.upstash.qStashToken,
});

const qStashClient = new QStashClient({
  token: config.env.upstash.qStashToken,
});

const sendEmail = async ({
  body,
  email,
  subject,
}: {
  email: string;
  subject: string;
  body: string;
}) => {
  await qStashClient.publishJSON({
    api: {
      name: "email",
      provider: resend({ token: config.env.resend.token }),
    },
    body: {
      from: "JSM <hello.adrianjsmastery.com>",
      to: [email],
      subject,
      html: body,
    },
  });
};

export { workflowClient, sendEmail };
