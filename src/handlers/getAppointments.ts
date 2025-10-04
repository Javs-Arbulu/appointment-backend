import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

const tableName = process.env.APPOINTMENTS_TABLE || "AppointmentsTable";

export const main: APIGatewayProxyHandler = async () => {
  try {
    const result = await ddb.send(new ScanCommand({ TableName: tableName }));

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "List of appointments",
        data: result.Items || [],
      }),
    };
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
