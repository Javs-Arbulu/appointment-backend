import type { AWS } from "@serverless/typescript";

const serverlessConfiguration: AWS = {
  service: "appointment-service",
  frameworkVersion: "3",
  plugins: ["serverless-dotenv-plugin", "serverless-esbuild", "serverless-offline"],
  custom: {
    dotenv: {
      path: ".env.local"
    }
  },
  provider: {
    name: "aws",
    runtime: "nodejs18.x",
    region: "us-east-1",
    stage: "${opt:stage, 'dev'}",
    environment: {
      APPOINTMENTS_TABLE: "${self:service}-Appointments-${sls:stage}",
      NOTIFICATIONS_QUEUE_URL: "${env:NOTIFICATIONS_QUEUE_URL, ''}",
      NOTIFICATIONS_TOPIC_ARN: "${env:NOTIFICATIONS_TOPIC_ARN, ''}",
      // Fallback URLs when env vars are empty (for AWS deployment)
      AWS_NOTIFICATIONS_QUEUE_URL: { "Fn::GetAtt": ["NotificationsQueue", "QueueUrl"] },
      AWS_NOTIFICATIONS_TOPIC_ARN: { Ref: "NotificationsTopic" },
      LOCAL_NOTIFICATIONS_TOPIC_ARN:
        "arn:aws:sns:us-east-1:000000000000:local-topic",
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: [
          "dynamodb:PutItem",
          "dynamodb:Scan",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
        ],
        Resource: { "Fn::GetAtt": ["AppointmentsTable", "Arn"] },
      },
      {
        Effect: "Allow",
        Action: ["sqs:*"],
        Resource: { "Fn::GetAtt": ["NotificationsQueue", "Arn"] },
      },
      {
        Effect: "Allow",
        Action: ["sns:*"],
        Resource: { Ref: "NotificationsTopic" },
      },
      {
        Effect: "Allow",
        Action: ["events:*"],
        Resource: { "Fn::GetAtt": ["ReminderBus", "Arn"] },
      },
    ],
  },
  functions: {
    createAppointment: {
      handler: "src/handlers/createAppointment.main",
      events: [
        {
          httpApi: {
            path: "/appointments",
            method: "post",
          },
        },
      ],
    },
    getAppointments: {
      handler: "src/handlers/getAppointments.main",
      events: [
        {
          httpApi: {
            path: "/appointments",
            method: "get",
          },
        },
      ],
    },
    notifyAppointment: {
      handler: "src/handlers/notifyAppointment.main",
      events: [
        {
          sqs: {
            arn: { "Fn::GetAtt": ["NotificationsQueue", "Arn"] },
          },
        },
      ],
    },
  },
  resources: {
    Resources: {
      AppointmentsTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "${self:service}-Appointments-${sls:stage}",
          AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
          KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
          BillingMode: "PAY_PER_REQUEST",
        },
      },
      NotificationsQueue: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "${self:service}-Notifications-${sls:stage}",
        },
      },
      NotificationsTopic: {
        Type: "AWS::SNS::Topic",
        Properties: {
          TopicName: "${self:service}-Notifications-${sls:stage}",
        },
      },
      ReminderBus: {
        Type: "AWS::Events::EventBus",
        Properties: {
          Name: "${self:service}-ReminderBus-${sls:stage}",
        },
      },
    },
    Outputs: {
      NotificationsQueueUrl: {
        Value: { "Fn::GetAtt": ["NotificationsQueue", "QueueUrl"] },
        Export: {
          Name: "${self:service}-${sls:stage}-NotificationsQueueUrl"
        }
      },
      NotificationsTopicArn: {
        Value: { Ref: "NotificationsTopic" },
        Export: {
          Name: "${self:service}-${sls:stage}-NotificationsTopicArn"
        }
      }
    }
  },
};

module.exports = serverlessConfiguration;
