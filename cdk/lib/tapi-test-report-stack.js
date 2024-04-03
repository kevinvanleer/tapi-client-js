const cdk = require('aws-cdk-lib');
const {
  aws_cloudfront_origins: origins,
  aws_s3: s3,
  aws_iam: iam,
  aws_s3_deployment: s3deploy,
  aws_cloudfront: cloudfront,
  RemovalPolicy,
} = require('aws-cdk-lib');
const path = require('path');

class TapiTestReportStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Create an S3 bucket for your static website
    const websiteBucket = new s3.Bucket(this, 'TapiTestReportBucket', {
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      accessControl: s3.BucketAccessControl.PRIVATE,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    const oai = new cloudfront.OriginAccessIdentity(this, 'OriginAccessIdentity');
    websiteBucket.grantRead(oai);

    websiteBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [websiteBucket.arnForObjects('*')],
        principals: [new iam.CanonicalUserPrincipal(oai.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
      }),
    );

    // Create a CloudFront distribution for the website
    const distribution = new cloudfront.Distribution(this, 'TapiTestReportDistribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket, {
          originAccessIdentity: oai,
        }),
      },
    });

    // Upload the static website files to the S3 bucket
    const s3upload = new s3deploy.BucketDeployment(this, 'TapiTestReportDeployment', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../html-report'))], // Replace with your local folder path
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // Create a Route53 hosted zone if needed
    // const hostedZone = new route53.HostedZone(this, 'WebsiteHostedZone', {
    //  zoneName: 'example.com', // Replace with your domain name
    // });

    // Create a Route53 alias record for the CloudFront distribution
    // new route53.ARecord(this, 'WebsiteAliasRecord', {
    //  zone: hostedZone,
    //  target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    //  recordName: 'example.com', // Replace with your domain name
    // });
  }
}

module.exports = { TapiTestReportStack };
