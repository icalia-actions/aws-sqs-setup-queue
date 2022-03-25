import { info, getInput, setOutput } from "@actions/core";

import SQS, {
  QueueAttributeMap,
  TagMap,
  CreateQueueRequest
} from "aws-sdk/clients/sqs";

import { AWSError } from "aws-sdk/lib/error";

let region: string | undefined
region = process.env.AWS_REGION;
if (!region) region = process.env.AWS_DEFAULT_REGION;

const client = new SQS({
  region,
  customUserAgent: "icalia-actions/aws-action"
});

async function getQueueUrl(queueName: string): Promise<string | undefined> {
  try {
    const result = await client.getQueueUrl({ QueueName: queueName }).promise();
    return result.QueueUrl;
  } catch (err) {
    if ((err as AWSError).code === "AWS.SimpleQueueService.NonExistentQueue") {
      return; 
    }

    throw err;
  }
}

async function setupQueueTags(queueUrl: string, tags: TagMap | undefined) {
  if (!tags) return;
  const result = await client.tagQueue({ QueueUrl: queueUrl, Tags: tags }).promise();
  info(`Tags set for queue ${queueUrl}`);
}

async function setupQueueAttributes(queueUrl: string, attributes: QueueAttributeMap | undefined) {
  if (!attributes) return;
  const result = await client.setQueueAttributes({ QueueUrl: queueUrl, Attributes: attributes }).promise();
  info(`Attributes set for queue ${queueUrl}`);
}

function parseInput(): CreateQueueRequest {
  const tags = getInput("tags");
  const attributes = getInput("attributes");
  const queueName = getInput("queue-name", { required: true });

  return {
    QueueName: queueName,
    tags: tags ? JSON.parse(tags) : undefined,
    Attributes: attributes ? JSON.parse(attributes) : undefined
  };
}

export async function run() {
  const request = parseInput();

  console.log("request:", request);
  
  let queueUrl = await getQueueUrl(request.QueueName);
  if (queueUrl) {
    await setupQueueTags(queueUrl, request.tags);
    await setupQueueAttributes(queueUrl, request.Attributes);
  } else {
    const result = await client.createQueue(request).promise();
    queueUrl = result.QueueUrl;
  }

  setOutput("queue-url", queueUrl);

  return 0;
}