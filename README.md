# cloudwatch-cleaner

Deletes all CloudWatch log groups in your default AWS account and region, except for a configurable exclusion list.

## Requirements

- Node.js 22+
- AWS credentials configured (via `~/.aws/credentials`, environment variables, or IAM role)

## Install

```bash
npm install
npm link
```

After `npm link`, the `cw-cleaner` command is available anywhere in your terminal.

## Usage

```bash
# Delete all log groups except the defaults
cw-cleaner

# Override the exclusion list
EXCLUDE_LOG_GROUPS="my-group,/aws/lambda/fn" cw-cleaner

# Preview without deleting
DRY_RUN=true cw-cleaner
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `EXCLUDE_LOG_GROUPS` | `aws/spans,some-other` | Comma-separated list of log group names to keep |
| `DRY_RUN` | `false` | Set to `true` to print what would be deleted without deleting |

The AWS region and credentials are resolved automatically by the SDK (environment variables, `~/.aws/config`, instance profile, etc.).
