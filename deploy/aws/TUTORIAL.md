# Deploy Tuple on AWS

This walkthrough deploys Tuple on AWS with ECS Fargate, RDS PostgreSQL, Secrets Manager, and an Application Load Balancer. The stack uses public ECS tasks behind the load balancer and private RDS subnets, so it does not create a NAT gateway.

## Prerequisites

- An AWS account with billing enabled.
- Permission to create CloudFormation stacks, IAM roles, VPC resources, ECS, RDS, Elastic Load Balancing, CloudWatch Logs, and Secrets Manager secrets.
- AWS CloudShell or a local shell with `aws` and `git` installed.

This stack creates paid resources, including an Application Load Balancer, ECS Fargate tasks, and RDS PostgreSQL.

The default template exposes Tuple over HTTP on the generated load balancer DNS name. Configure TLS with your own domain and ACM certificate before using the deployment for production authentication traffic.

## Open AWS CloudShell

Open [AWS CloudShell](https://console.aws.amazon.com/cloudshell/home), choose the region you want to deploy into, then run:

```bash
git clone https://github.com/tupleai/tuple.git
cd tuple
AWS_REGION=us-east-1 ./deploy/aws/deploy.sh
```

Change `AWS_REGION` if you deploy outside `us-east-1`.

The first deploy usually takes 10-15 minutes because RDS needs time to provision.

## Configuration

The deploy script exposes the common settings as environment variables:

```bash
STACK_NAME=tuple \
SERVICE_NAME=tuple \
AWS_REGION=us-east-1 \
IMAGE_URL=docker.io/tupleai/tuple:6 \
DATABASE_INSTANCE_CLASS=db.t4g.micro \
DESIRED_COUNT=1 \
./deploy/aws/deploy.sh
```

The CloudFormation template generates these runtime values in Secrets Manager:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `TUPLE_ENCRYPTION_KEY`

Tuple runs with:

- `PORT=2099`
- `BIND_ADDRESS=0.0.0.0`
- `TUPLE_MODE=selfhosted`
- `BETTER_AUTH_URL=http://<load-balancer-dns-name>`

## Open Tuple

After deployment, the script prints `ServiceUrl` and `HealthCheckUrl`.

To fetch them again:

```bash
aws cloudformation describe-stacks \
  --region us-east-1 \
  --stack-name tuple \
  --query "Stacks[0].Outputs[?OutputKey=='ServiceUrl' || OutputKey=='HealthCheckUrl'].[OutputKey,OutputValue]" \
  --output table
```

Open `ServiceUrl` and create the first account. The first account becomes the admin.

To verify the deployment:

```bash
HEALTH_URL="$(aws cloudformation describe-stacks \
  --region us-east-1 \
  --stack-name tuple \
  --query "Stacks[0].Outputs[?OutputKey=='HealthCheckUrl'].OutputValue" \
  --output text)"

curl -sSf "$HEALTH_URL"
```

## Tearing it down

```bash
aws cloudformation delete-stack --region us-east-1 --stack-name tuple
aws cloudformation wait stack-delete-complete --region us-east-1 --stack-name tuple
```

If you deployed with `DATABASE_DELETION_PROTECTION=true`, redeploy with `DATABASE_DELETION_PROTECTION=false` before deleting the stack.

## Quick-create button

The README badge opens AWS CloudFormation quick-create with the published template:

- Template URL: `https://tupleai-tuple-deploy-templates.s3.us-east-1.amazonaws.com/tuple.yaml`
- Quick-create URL: `https://console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/quickcreate?stackName=tuple&templateURL=https%3A%2F%2Ftupleai-tuple-deploy-templates.s3.us-east-1.amazonaws.com%2Ftuple.yaml`
