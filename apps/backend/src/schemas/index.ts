import { Static } from '@sinclair/typebox';

// Re-export base schemas
export { BaseSchemas, ResponseSchemas } from './base.js';

export * from './auth.schemas.js';
export * from './projects.schemas.js';
export * from './tasks.schemas.js';
export * from './users.schemas.js';

import { BaseSchemas } from './base.js';

export type BaseId = Static<typeof BaseSchemas.Id>;
export type BaseEmail = Static<typeof BaseSchemas.Email>;
export type BasePassword = Static<typeof BaseSchemas.Password>;
export type BaseName = Static<typeof BaseSchemas.Name>;
export type BaseTimestamp = Static<typeof BaseSchemas.Timestamp>;
export type BaseError = Static<typeof BaseSchemas.Error>;
