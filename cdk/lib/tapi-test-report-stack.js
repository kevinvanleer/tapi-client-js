const cdk = require('aws-cdk-lib');
const {
  aws_s3: s3,
  aws_s3_deployment: s3deploy,
  aws_cloudfront: cloudfront,

} = require('aws-cdk-lib');
// const s3 = require('@aws-cdk/aws-s3');
// const s3deploy = require('@aws-cdk/aws-s3-deployment');
// const cloudfront = require('@aws-cdk/aws-cloudfront');
// const route53 = require('@aws-cdk/aws-route53');
// const targets = require('@aws-cdk/aws-route53-targets');
const path = require('path');

class TapiTestReportStackStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Create an S3 bucket for your static website
    const websiteBucket = new s3.Bucket(this, 'TapiTestReportBucket', {
      websiteIndexDocument: 'index.html', // The main HTML file
    });

    // Upload the static website files to the S3 bucket
    s3deploy.BucketDeployment(this, 'WebsiteDeployment', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../html-report'))], // Replace with your local folder path
      destinationBucket: websiteBucket,
    });

    // Create a CloudFront distribution for the website
    const distribution = new cloudfront.CloudFrontWebDistribution(this, 'TapiTestReportDistribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: websiteBucket,
          },
          behaviors: [{ isDefaultBehavior: true }],
        },
      ],
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

module.exports = { TapiTestReportStackStack };
