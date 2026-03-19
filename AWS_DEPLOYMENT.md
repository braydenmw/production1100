# AWS Deployment Configuration for BWGA Ai

## Required AWS Services

### 1. Amazon Bedrock
- **Region**: us-east-1 (or your preferred region with Bedrock)
- **Models Required**: 
  - `anthropic.claude-3-sonnet-20240229-v1:0` (primary)
  - `anthropic.claude-3-haiku-20240307-v1:0` (fallback/lighter)

### 2. IAM Role Permissions
Create an IAM role with this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BedrockAccess",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0",
        "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-haiku-20240307-v1:0"
      ]
    }
  ]
}
```

## Environment Variables

Set these on your AWS deployment (EC2, ECS, Lambda, Elastic Beanstalk):

```bash
# Required — at least one AI provider key must be set
GROQ_API_KEY=your-groq-key
AWS_REGION=us-east-1
NODE_ENV=production
PORT=3000

# Optional additional AI providers (fallback chain: Groq → Together → Gemini → OpenAI)
TOGETHER_API_KEY=your-together-key
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key

# App Configuration
REACT_APP_USE_REAL_AI=true
REACT_APP_USE_REAL_DATA=true
```

## Deployment Steps

### Option A: AWS Elastic Beanstalk (Recommended)

1. Install EB CLI: `pip install awsebcli`
2. Initialize: `eb init -p node.js bw-nexus-ai --region us-east-1`
3. Create environment: `eb create production --instance-type t3.medium`
4. Deploy: `eb deploy`

### Option B: AWS ECS with Docker

1. Build Docker image: `docker build -t bw-nexus-ai .`
2. Push to ECR: 
   ```bash
   aws ecr create-repository --repository-name bw-nexus-ai
   docker tag bw-nexus-ai:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/bw-nexus-ai
   docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/bw-nexus-ai
   ```
3. Create ECS cluster and service

### Option C: AWS Lambda with API Gateway

1. Package: `npm run build:all`
2. Create Lambda function from dist-server
3. Configure API Gateway as trigger

## Bedrock Model Access

Before deploying, ensure you have requested access to Claude models:

1. Go to AWS Console â†’ Amazon Bedrock
2. Navigate to "Model access"
3. Request access to:
   - Anthropic Claude 3 Sonnet
   - Anthropic Claude 3 Haiku (optional fallback)
4. Wait for approval (usually instant)

## Architecture on AWS

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                         AWS Cloud                           â”‚
â”‚                                                             â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚   CloudFront â”‚â”€â”€â”€â”€â–¶â”‚   ALB/API    â”‚â”€â”€â”€â”€â–¶â”‚   ECS/EC2   â”‚ â”‚
â”‚  â”‚   (Static)   â”‚     â”‚   Gateway    â”‚     â”‚   (Node.js) â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                                    â”‚        â”‚
â”‚                                              â”Œâ”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”  â”‚
â”‚                                              â”‚  Bedrock  â”‚  â”‚
â”‚                                              â”‚  (Claude) â”‚  â”‚
â”‚                                              â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

## How It Works

1. **BW AI Search**: User searches for a location
2. **Backend Route**: Request goes to `/api/bedrock/invoke`
3. **Bedrock Call**: Server uses AWS SDK to call Claude
4. **Response**: AI generates location intelligence
5. **No Rate Limits**: AWS Bedrock uses pay-per-use, no request limits

## Cost Estimation

| Component | Cost |
|-----------|------|
| Bedrock Claude 3 Sonnet | $0.003/1K input tokens, $0.015/1K output |
| EC2 t3.medium | ~$30/month |
| CloudFront | ~$10/month |
| **Estimated Monthly** | **$50-100** depending on usage |

## Monitoring

- Enable CloudWatch Logs for the application
- Set up Bedrock usage metrics in CloudWatch
- Create alarms for error rates and latency

## Support

For issues with:
- Bedrock access: Check IAM permissions and model access
- Rate limits: AWS Bedrock has very high limits (100+ requests/sec)
- Costs: Set up AWS Budgets to monitor spending

