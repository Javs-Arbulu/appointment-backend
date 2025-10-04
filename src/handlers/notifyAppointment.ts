import { SQSEvent } from "aws-lambda";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const sns = new SNSClient({});

export const main = async (event: SQSEvent) => {
  if (!event.Records || event.Records.length === 0) {
    console.log("No records received in event");
    return { statusCode: 400, body: "No records to process" };
  }

  const topicArn = process.env.NOTIFICATIONS_TOPIC_ARN;

  for (const record of event.Records) {
    const appointment = JSON.parse(record.body);

    if (!topicArn || !topicArn.startsWith("arn:")) {
      // Local simulation
      console.log("Local notification for appointment:", appointment.id);
      continue;
    }

    try {
      await sns.send(
        new PublishCommand({
          TopicArn: topicArn,
          Message: `New appointment for insuredId ${appointment.insuredId} scheduled at ${appointment.scheduleId}`,
          Subject: "New Appointment Notification",
        })
      );
      console.log("Notification sent for appointment:", appointment.id);
    } catch (err) {
      console.error("Error sending SNS notification:", err);
    }
  }

  return { statusCode: 200, body: "Notifications processed" };
};
