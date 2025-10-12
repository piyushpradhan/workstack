export { ResponseHelper } from './response.js';
export { ValidationHelper } from './validation.js';
export { LoggerHelper } from './logger.js';

export const emailToName = (email: string): string => {
  const derivedName = email.split('@')[0];
  return derivedName;
};
