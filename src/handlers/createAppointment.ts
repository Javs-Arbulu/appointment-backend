import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

const sqsClient = new SQSClient({});

const tableName = process.env.APPOINTMENTS_TABLE || "AppointmentsTable";
const queueUrl = process.env.NOTIFICATIONS_QUEUE_URL || process.env.AWS_NOTIFICATIONS_QUEUE_URL;
const isLocal = process.env.IS_OFFLINE === 'true';

export const main: APIGatewayProxyHandler = async (event) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing request body" }),
      };
    }

    const { insuredId, scheduleId, countryISO } = JSON.parse(event.body);

    if (!insuredId || !scheduleId || !countryISO) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required fields" }),
      };
    }

    const appointmentId = uuidv4();

    const item = {
      id: appointmentId,
      insuredId,
      scheduleId,
      countryISO,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    // Guardar en DynamoDB
    await ddb.send(
      new PutCommand({
        TableName: tableName,
        Item: item,
      })
    );

    // Enviar mensaje a SQS o simular en local
    if (isLocal) {
      // Modo local - usar URL del .env si está disponible, sino simular
      if (queueUrl && queueUrl !== "" && typeof queueUrl === "string") {
        try {
          await sqsClient.send(
            new SendMessageCommand({
              QueueUrl: queueUrl,
              MessageBody: JSON.stringify(item),
            })
          );
          console.log("Message sent to SQS (local) successfully for appointment:", item.id);
        } catch (err) {
          console.error("Error sending message to SQS (local):", err);
          // Fallback a simulación si falla el envío real
          console.log("Fallback: Local SQS simulation - Notification would be sent for:", {
            appointmentId: item.id,
            insuredId: item.insuredId,
            scheduleId: item.scheduleId,
            countryISO: item.countryISO,
          });
        }
      } else {
        console.log("Local SQS simulation - Notification would be sent for:", {
          appointmentId: item.id,
          insuredId: item.insuredId,
          scheduleId: item.scheduleId,
          countryISO: item.countryISO,
        });
      }
    } else {
      // Modo AWS - usar la URL de CloudFormation
      if (queueUrl && typeof queueUrl === "string") {
        try {
          await sqsClient.send(
            new SendMessageCommand({
              QueueUrl: queueUrl,
              MessageBody: JSON.stringify(item),
            })
          );
          console.log("Message sent to SQS (AWS) successfully for appointment:", item.id);
        } catch (err) {
          console.error("Error sending message to SQS (AWS):", err);
        }
      } else {
        console.error("Queue URL not properly configured in AWS environment");
      }
    }

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Appointment created successfully",
        data: item,
      }),
    };
  } catch (error) {
    console.error("Error saving appointment:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
