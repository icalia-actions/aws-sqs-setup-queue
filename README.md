# Setup AWS SQS Queue

Creates or updates a SQS queue

## Usage

```yaml
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1.6.1

      - name: Deploy AWS ECS Service
        uses: icalia-actions/aws-sqs-setup-queue@v0.0.1
        with:
          queue-name: my-queue
          
          # You can optionally specify the queue attributes, which will update
          # the queue if it already exists, or create the queue with them:
          attributes: |-
            {
              "DelaySeconds":"10"
            }

          
          # You can optionally specify the queue tags, which will update
          # the queue if it already exists, or create the queue with them:
          tags: |-
            {
              "app":"clinical-trials"
            }
```