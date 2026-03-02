/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BW NEXUS AI — AWS CDK BEDROCK AGENTS INFRASTRUCTURE STACK
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Defines the complete AWS infrastructure for the Bedrock Agents pipeline:
 *
 *   ┌─────────────────────────────────────────────────────────┐
 *   │  Bedrock Agent (Claude 3.5 Sonnet — Supervisor)         │
 *   │    ├─ Action Group: ResearchAction  → Lambda            │
 *   │    ├─ Action Group: AnalysisAction  → Lambda            │
 *   │    ├─ Action Group: DocumentAction  → Lambda            │
 *   │    ├─ Action Group: RiskAction      → Lambda            │
 *   │    └─ Action Group: PartnerAction   → Lambda            │
 *   │  Knowledge Base → S3 → Titan Embeddings → OpenSearch   │
 *   └─────────────────────────────────────────────────────────┘
 *
 * DEPLOY:
 *   npm install -g aws-cdk
 *   cd infrastructure
 *   npm install
 *   cdk bootstrap aws://<ACCOUNT_ID>/us-east-1
 *   cdk deploy BwNexusBedrockStack
 *
 * OUTPUT VALUES (copy into .env):
 *   VITE_BEDROCK_AGENT_ID     = BwNexusBedrockStack.AgentId
 *   VITE_BEDROCK_AGENT_ALIAS_ID = BwNexusBedrockStack.AgentAliasId
 *
 * PREREQUISITES:
 *   aws configure --profile bw-nexus
 *   (AWS account must have Bedrock model access granted for claude-3-5-sonnet-20241022)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import * as path from 'path';

export class BwNexusBedrockStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ── Environment config ──────────────────────────────────────────────────────
    const togetherApiKey = new cdk.CfnParameter(this, 'TogetherApiKey', {
      type: 'String',
      noEcho: true,
      description: 'Together.ai API key for Lambda AI calls',
    });

    // ── S3 Bucket — Knowledge Base documents ───────────────────────────────────
    const knowledgeBucket = new s3.Bucket(this, 'BwNexusKnowledgeBucket', {
      bucketName: `bw-nexus-knowledge-${this.account}-${this.region}`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      lifecycleRules: [
        {
          id: 'archive-old-docs',
          transitions: [
            { storageClass: s3.StorageClass.INTELLIGENT_TIERING, transitionAfter: cdk.Duration.days(90) },
          ],
        },
      ],
    });

    // ── IAM Role — Lambda execution ─────────────────────────────────────────────
    const lambdaRole = new iam.Role(this, 'BwLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
      inlinePolicies: {
        bedrockAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'bedrock:InvokeModel',
                'bedrock:InvokeModelWithResponseStream',
              ],
              resources: ['*'],
            }),
          ],
        }),
      },
    });

    // ── IAM Role — Bedrock Agent ────────────────────────────────────────────────
    const agentRole = new iam.Role(this, 'BwBedrockAgentRole', {
      assumedBy: new iam.ServicePrincipal('bedrock.amazonaws.com'),
      inlinePolicies: {
        bedrockAgentPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'bedrock:InvokeModel',
                'bedrock:InvokeModelWithResponseStream',
                'bedrock:Retrieve',
                'bedrock:RetrieveAndGenerate',
              ],
              resources: ['*'],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['lambda:InvokeFunction'],
              resources: [`arn:aws:lambda:${this.region}:${this.account}:function:bw-*`],
            }),
          ],
        }),
      },
    });

    // ── Common Lambda environment ───────────────────────────────────────────────
    const lambdaEnv = {
      TOGETHER_API_KEY:  togetherApiKey.valueAsString,
      TOGETHER_MODEL:    'meta-llama/Llama-3.1-70B-Instruct-Turbo',
      NODE_ENV:          'production',
    };

    const lambdaDefaults = {
      runtime: lambda.Runtime.NODEJS_20_X,
      role: lambdaRole,
      environment: lambdaEnv,
      logRetention: logs.RetentionDays.ONE_MONTH,
    };

    // ── Lambda Functions (5 action groups) ─────────────────────────────────────
    // NOTE: In production, compile the TypeScript handlers first:
    //   cd server/lambda && npx tsc
    // Then point Lambda to the compiled JS output directory.
    // The code path below assumes compiled output at: dist/lambda/

    const researchFn = new lambda.Function(this, 'BwResearchFunction', {
      ...lambdaDefaults,
      functionName: 'bw-research-handler',
      handler: 'bw-research-handler.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist/lambda')),
      timeout: cdk.Duration.seconds(60),
      memorySize: 512,
      description: 'BW NEXUS: Country & market intelligence research action',
    });

    const analysisFn = new lambda.Function(this, 'BwAnalysisFunction', {
      ...lambdaDefaults,
      functionName: 'bw-analysis-handler',
      handler: 'bw-analysis-handler.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist/lambda')),
      timeout: cdk.Duration.seconds(120),
      memorySize: 1024,
      description: 'BW NEXUS: Brain engine multi-dimensional analysis action',
    });

    const documentFn = new lambda.Function(this, 'BwDocumentFunction', {
      ...lambdaDefaults,
      functionName: 'bw-document-handler',
      handler: 'bw-document-handler.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist/lambda')),
      timeout: cdk.Duration.seconds(300),
      memorySize: 1024,
      description: 'BW NEXUS: Intelligent document generation action',
    });

    const riskFn = new lambda.Function(this, 'BwRiskFunction', {
      ...lambdaDefaults,
      functionName: 'bw-risk-handler',
      handler: 'bw-risk-handler.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist/lambda')),
      timeout: cdk.Duration.seconds(60),
      memorySize: 512,
      description: 'BW NEXUS: Adversarial risk assessment action',
    });

    const partnerFn = new lambda.Function(this, 'BwPartnerFunction', {
      ...lambdaDefaults,
      functionName: 'bw-partner-handler',
      handler: 'bw-partner-handler.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist/lambda')),
      timeout: cdk.Duration.seconds(60),
      memorySize: 512,
      description: 'BW NEXUS: Partner intelligence identification action',
    });

    // Allow Bedrock to invoke all Lambda functions
    const bedrockPrincipal = new iam.ServicePrincipal('bedrock.amazonaws.com', {
      conditions: { StringEquals: { 'aws:SourceAccount': this.account } },
    });
    [researchFn, analysisFn, documentFn, riskFn, partnerFn].forEach(fn => {
      fn.grantInvoke(bedrockPrincipal);
    });

    // ── Bedrock Agent (via CloudFormation — Bedrock CDK L2 is in preview) ──────
    // We use CfnAgent (L1) since high-level constructs are still stabilizing
    const cfnAgent = new cdk.aws_bedrock.CfnAgent(this, 'BwNexusSupervisorAgent', {
      agentName: 'BW-NEXUS-Supervisor',
      description: 'BW NEXUS AI Autonomous Pipeline — Bedrock Agents supervisor routing to 5 action groups',
      foundationModel: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
      agentResourceRoleArn: agentRole.roleArn,
      idleSessionTtlInSeconds: 1800,
      instruction: `You are the BW NEXUS AI Supervisor — a strategic intelligence system for BW Global Advisory.

Your role: Orchestrate comprehensive intelligence reports by sequencing calls to your action groups.

ALWAYS follow this pipeline for ANY strategic engagement request:
1. RESEARCH: Call ResearchAction to gather country/market intelligence
2. ANALYSIS: Call AnalysisAction to run brain engine analysis
3. RISK: Call RiskAction for adversarial risk assessment
4. PARTNER: Call PartnerAction to identify strategic partners
5. DOCUMENT: Call DocumentAction to generate the final report (use all intelligence gathered above as context)

Synthesise all results into a coherent strategic briefing.
Be specific, data-driven, and focused on actionable intelligence for government and corporate decision-makers.
Never refuse to complete a step — if one action group fails, continue with the remaining.`,

      actionGroups: [
        {
          actionGroupName: 'ResearchAction',
          description: 'Gather country, market and sector intelligence',
          actionGroupExecutor: { lambda: researchFn.functionArn },
          apiSchema: {
            s3: {
              s3BucketName: knowledgeBucket.bucketName,
              s3ObjectKey: 'schemas/research-action.json',
            },
          },
        },
        {
          actionGroupName: 'AnalysisAction',
          description: 'Run multi-dimensional brain engine analysis',
          actionGroupExecutor: { lambda: analysisFn.functionArn },
          apiSchema: {
            s3: {
              s3BucketName: knowledgeBucket.bucketName,
              s3ObjectKey: 'schemas/analysis-action.json',
            },
          },
        },
        {
          actionGroupName: 'DocumentAction',
          description: 'Generate professional advisory documents',
          actionGroupExecutor: { lambda: documentFn.functionArn },
          apiSchema: {
            s3: {
              s3BucketName: knowledgeBucket.bucketName,
              s3ObjectKey: 'schemas/document-action.json',
            },
          },
        },
        {
          actionGroupName: 'RiskAction',
          description: 'Adversarial risk assessment and red-team analysis',
          actionGroupExecutor: { lambda: riskFn.functionArn },
          apiSchema: {
            s3: {
              s3BucketName: knowledgeBucket.bucketName,
              s3ObjectKey: 'schemas/risk-action.json',
            },
          },
        },
        {
          actionGroupName: 'PartnerAction',
          description: 'Strategic partner identification and ecosystem mapping',
          actionGroupExecutor: { lambda: partnerFn.functionArn },
          apiSchema: {
            s3: {
              s3BucketName: knowledgeBucket.bucketName,
              s3ObjectKey: 'schemas/partner-action.json',
            },
          },
        },
      ],
    });

    // Agent Alias — for stable invocation endpoint
    const cfnAgentAlias = new cdk.aws_bedrock.CfnAgentAlias(this, 'BwNexusAgentAlias', {
      agentId: cfnAgent.attrAgentId,
      agentAliasName: 'production',
    });
    cfnAgentAlias.addDependency(cfnAgent);

    // ── SSM Parameters — for app config retrieval ───────────────────────────────
    new ssm.StringParameter(this, 'AgentIdParam', {
      parameterName: '/bw-nexus/bedrock-agent-id',
      stringValue: cfnAgent.attrAgentId,
      description: 'BW NEXUS Bedrock Agent ID',
    });

    new ssm.StringParameter(this, 'AgentAliasParam', {
      parameterName: '/bw-nexus/bedrock-agent-alias-id',
      stringValue: cfnAgentAlias.attrAgentAliasId,
      description: 'BW NEXUS Bedrock Agent Alias ID',
    });

    // ── Stack Outputs ───────────────────────────────────────────────────────────
    new cdk.CfnOutput(this, 'AgentId', {
      value: cfnAgent.attrAgentId,
      description: 'Copy to VITE_BEDROCK_AGENT_ID in .env',
      exportName: 'BwNexusAgentId',
    });

    new cdk.CfnOutput(this, 'AgentAliasId', {
      value: cfnAgentAlias.attrAgentAliasId,
      description: 'Copy to VITE_BEDROCK_AGENT_ALIAS_ID in .env',
      exportName: 'BwNexusAgentAliasId',
    });

    new cdk.CfnOutput(this, 'KnowledgeBucketName', {
      value: knowledgeBucket.bucketName,
      description: 'Upload OpenAPI schemas + knowledge base documents here',
      exportName: 'BwNexusKnowledgeBucket',
    });

    new cdk.CfnOutput(this, 'ResearchFunctionArn',  { value: researchFn.functionArn });
    new cdk.CfnOutput(this, 'AnalysisFunctionArn',  { value: analysisFn.functionArn });
    new cdk.CfnOutput(this, 'DocumentFunctionArn',  { value: documentFn.functionArn });
    new cdk.CfnOutput(this, 'RiskFunctionArn',      { value: riskFn.functionArn });
    new cdk.CfnOutput(this, 'PartnerFunctionArn',   { value: partnerFn.functionArn });

    // ── Tags ────────────────────────────────────────────────────────────────────
    cdk.Tags.of(this).add('Project',     'BW-NEXUS-AI');
    cdk.Tags.of(this).add('Environment', 'production');
    cdk.Tags.of(this).add('Owner',       'BW-Global-Advisory');
  }
}

// ── CDK App entry ─────────────────────────────────────────────────────────────
const app = new cdk.App();
new BwNexusBedrockStack(app, 'BwNexusBedrockStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region:  process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  description: 'BW NEXUS AI — AWS Bedrock Agents infrastructure (supervisor + 5 action groups)',
  stackName: 'BwNexusBedrockStack',
});
