import { randomUUID } from 'node:crypto';
export const createRunId = (): string => `eagro-${randomUUID()}`;
