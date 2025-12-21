import { getCdnImageUrl } from '../../../utils/cdn-helper';

export type WorkShop = {
    id: string;
    title: string;
    description: string;
    url: string;
    img: string;
    techStacks: string[];
    isHaveTerraform: boolean;
    createdDate: string;
    githubUrl: string;
}

export const workshops: WorkShop[] = [
    {
        id: "001",
        title: "Deploy Static Site NextJS App to S3 using Github Action",
        description: "In this workshop, you'll learn the basics and practice of Amazon S3, Cloudfront, using IAM OIDC STS with Github Action. Perform creating NextJs App with low latency.",
        url: "https://01.nqnam.dev",
        img: getCdnImageUrl("001-deploy-static-site-to-s3.png"),
        techStacks: ["S3", "IAM", "Cloudfront", "Github Actions"],
        isHaveTerraform: true,
        githubUrl: "https://github.com/TsuKpa/aws-ws-001-deploy-static-site-to-s3",
        createdDate: "2024-01-15"
    },
    {
        id: "002",
        title: "Leveraging Amazon Bedrock to enhance Customer Support service with AI-Powered automated email responses",
        description: "This workshop will explore how to utilize Amazon Bedrock to build intelligent agent for reply email about order status, policy,...",
        url: "https://02.nqnam.dev",
        img: getCdnImageUrl("002-ai-powered-email-auto-replies.png"),
        techStacks: ["SES", "Amazon Bedrock", "SQS", "Lambda", "S3"],
        isHaveTerraform: true,
        githubUrl: "https://github.com/TsuKpa/aws-ws-002-ai-powered-email-auto-replies",
        createdDate: "2024-02-20"
    },
    {
        id: "003",
        title: "Deploy Laravel Application to EC2 with High Availability",
        description: "Deploy Laravel project to EC2 with Auto Scaling, Load balancing, send notification, ensure best practice in security when working with VPC and IAM",
        url: "https://03.nqnam.dev",
        img: getCdnImageUrl("003-deploy-ec2-laravel-auto-scaling.png"),
        techStacks: ["EC2", "ALB", "Secret Manager", "Cloudwatch", "AutoScaling"],
        isHaveTerraform: true,
        githubUrl: "https://github.com/TsuKpa/aws-ws-003-deploy-ec2-laravel-auto-scaling",
        createdDate: "2024-03-10"
    },
];
