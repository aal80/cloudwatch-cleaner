#!/usr/bin/env node

import {
  CloudWatchLogsClient,
  DescribeLogGroupsCommand,
  DeleteLogGroupCommand,
} from "@aws-sdk/client-cloudwatch-logs";

const EXCLUDE = (process.env.EXCLUDE_LOG_GROUPS || "aws/spans,some-other")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const DRY_RUN = process.env.DRY_RUN === "true";

const client = new CloudWatchLogsClient();

async function listAllLogGroups() {
  console.log("> listAllLogGroups");
  const groups = [];
  let nextToken;
  do {
    console.log("| getting next page...");
    const response = await client.send(
      new DescribeLogGroupsCommand({ nextToken, limit: 50 })
    );
    groups.push(...(response.logGroups || []));
    nextToken = response.nextToken;
  } while (nextToken);

  console.log(`| retrieved ${groups.length} log groups...`);
  return groups;
}

async function deleteLogGroups(groups) {
  console.log("> deleteLogGroups");
  let deleted = 0;
  let failed = 0;
  for (const { logGroupName } of groups) {
    try {
      await client.send(new DeleteLogGroupCommand({ logGroupName }));
      console.log(`| deleted: ${logGroupName}`);
      deleted++;
    } catch (err) {
      console.error(`| failed:  ${logGroupName} — ${err.message}`);
      failed++;
    }
  }
  console.log(`\nDone. Deleted: ${deleted}, Failed: ${failed}`);
}

console.log("-".repeat(20));
console.log(`CloudWatch Cleaner`);
console.log("-".repeat(20));
console.log("> Retrieving log groups...");

console.log("> Filtering...");
const all = await listAllLogGroups();
const toDelete = all.filter(({ logGroupName }) => !EXCLUDE.includes(logGroupName));

console.log(`| keeping: ${EXCLUDE.join(", ")}`);
console.log(`| found ${all.length} group(s) total. Deleting ${toDelete.length} log groups...`);

console.log("> Deleting...");
if (DRY_RUN) {
  toDelete.forEach(({ logGroupName }) => console.log(`| [dry-run] would delete: ${logGroupName}`));
} else {
  await deleteLogGroups(toDelete);
}
