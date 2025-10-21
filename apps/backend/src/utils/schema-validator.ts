import { Static, TSchema } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';
import { TypeCompiler } from '@sinclair/typebox/compiler';

/**
 * Schema validation utilities for production-grade applications
 */
export class SchemaValidator {
    /**
     * Compile a schema for better performance in production
     */
    static compile<T extends TSchema>(schema: T) {
        return TypeCompiler.Compile(schema);
    }

    /**
     * Validate data against a schema
     */
    static validate<T extends TSchema>(
        schema: T,
        data: unknown
    ): { valid: boolean; data?: Static<T>; errors?: string[] } {
        const errors: string[] = [];

        // Check if data matches the schema
        if (!Value.Check(schema, data)) {
            // Get detailed error information
            const errorIterator = [...Value.Errors(schema, data)];
            errors.push(...errorIterator.map(err => `${err.path}: ${err.message}`));

            return { valid: false, errors };
        }

        return { valid: true, data: data as Static<T> };
    }

    /**
     * Sanitize data according to schema (removes additional properties)
     */
    static sanitize<T extends TSchema>(
        schema: T,
        data: unknown
    ): Static<T> | null {
        try {
            return Value.Clean(schema, data) as Static<T>;
        } catch {
            return null;
        }
    }

    /**
     * Convert data to schema format (with type coercion)
     */
    static convert<T extends TSchema>(
        schema: T,
        data: unknown
    ): Static<T> | null {
        try {
            return Value.Convert(schema, data) as Static<T>;
        } catch {
            return null;
        }
    }

    /**
     * Create a validation middleware for Fastify
     */
    static createValidationMiddleware<T extends TSchema>(schema: T) {
        const compiled = this.compile(schema);

        return (data: unknown) => {
            const result = compiled.Check(data);
            if (!result) {
                const errors = [...compiled.Errors(data)];
                throw new Error(`Validation failed: ${errors.map(e => e.message).join(', ')}`);
            }
            return data as Static<T>;
        };
    }
}

/**
 * Fastify-specific validation helpers
 */
export class FastifySchemaValidator {
    /**
     * Validate request body
     */
    static validateBody<T extends TSchema>(
        schema: T,
        body: unknown
    ): Static<T> {
        const result = SchemaValidator.validate(schema, body);
        if (!result.valid) {
            throw new Error(`Body validation failed: ${result.errors?.join(', ')}`);
        }
        return result.data!;
    }

    /**
     * Validate request query parameters
     */
    static validateQuery<T extends TSchema>(
        schema: T,
        query: unknown
    ): Static<T> {
        const result = SchemaValidator.validate(schema, query);
        if (!result.valid) {
            throw new Error(`Query validation failed: ${result.errors?.join(', ')}`);
        }
        return result.data!;
    }

    /**
     * Validate request parameters
     */
    static validateParams<T extends TSchema>(
        schema: T,
        params: unknown
    ): Static<T> {
        const result = SchemaValidator.validate(schema, params);
        if (!result.valid) {
            throw new Error(`Params validation failed: ${result.errors?.join(', ')}`);
        }
        return result.data!;
    }
}

export default SchemaValidator;
