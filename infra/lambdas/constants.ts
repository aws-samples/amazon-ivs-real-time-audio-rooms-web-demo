const PARTICIPANT_TOKEN_DURATION_IN_MINUTES = 20160; // 14 days (max)

const RESOURCE_TAGS = { stack: process.env.STACK as string };

export { PARTICIPANT_TOKEN_DURATION_IN_MINUTES, RESOURCE_TAGS };
