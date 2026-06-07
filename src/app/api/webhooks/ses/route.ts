import { NextResponse } from "next/server";

import {
  confirmSnsSubscription,
  processSesNotificationEnvelope,
  verifySnsEnvelope,
} from "@/lib/email-delivery";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let envelope: {
    Type: "Notification" | "SubscriptionConfirmation" | "UnsubscribeConfirmation";
    MessageId: string;
    TopicArn: string;
    Subject?: string;
    Message: string;
    Timestamp: string;
    SignatureVersion: string;
    Signature: string;
    SigningCertURL: string;
    SubscribeURL?: string;
    Token?: string;
  };

  try {
    envelope = (await request.json()) as typeof envelope;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid SNS payload.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    await verifySnsEnvelope(envelope);

    if (envelope.Type === "SubscriptionConfirmation") {
      if (env.AWS_SES_WEBHOOK_AUTO_CONFIRM === "true") {
        await confirmSnsSubscription(envelope);
      }

      return NextResponse.json({
        ok: true,
        message:
          env.AWS_SES_WEBHOOK_AUTO_CONFIRM === "true"
            ? "SNS subscription confirmed."
            : "SNS subscription verified. Confirm it manually with SubscribeURL.",
      });
    }

    if (envelope.Type === "Notification") {
      const result = await processSesNotificationEnvelope(envelope);

      return NextResponse.json({
        ok: true,
        processedCount: result.processedCount,
        suppressedCount: result.suppressedCount,
      });
    }

    return NextResponse.json({
      ok: true,
      message: `SNS message type ${envelope.Type} acknowledged.`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to process SES webhook.";

    console.error("SES webhook processing failed", {
      message,
      type: envelope.Type,
      topicArn: envelope.TopicArn,
    });

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      {
        status: 400,
      },
    );
  }
}
