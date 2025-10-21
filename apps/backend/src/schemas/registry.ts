import { Type } from '@sinclair/typebox';
import { BaseSchemas, ResponseSchemas } from './base.js';
import { AuthRouteSchemas } from './auth.schemas.js';
import { ProjectRouteSchemas } from './projects.schemas.js';
import { UserRouteSchemas } from './users.schemas.js';

/**
 * Centralized schema registry for all API routes
 * This provides a single source of truth for all schemas
 */
export const SchemaRegistry = {
    auth: AuthRouteSchemas,

    projects: ProjectRouteSchemas,

    users: UserRouteSchemas,

    common: {
        Error: BaseSchemas.Error,
        Success: ResponseSchemas.Success,
        Pagination: ResponseSchemas.Pagination,
    },

    security: {
        BearerAuth: Type.Object({
            type: Type.Literal('http'),
            scheme: Type.Literal('bearer'),
            bearerFormat: Type.Literal('JWT'),
        }),
    },
};

/**
 * Helper function to get schema by path
 * Usage: getSchema('auth.login') or getSchema('projects.create')
 */
export const getSchema = (path: string): any => {
    const parts = path.split('.');
    let schema: any = SchemaRegistry;

    for (const part of parts) {
        if (schema && typeof schema === 'object' && part in schema) {
            schema = schema[part];
        } else {
            throw new Error(`Schema not found: ${path}`);
        }
    }

    return schema;
};

/**
 * Helper function to validate schema exists
 */
export const hasSchema = (path: string): boolean => {
    try {
        getSchema(path);
        return true;
    } catch {
        return false;
    }
};

export default SchemaRegistry;
