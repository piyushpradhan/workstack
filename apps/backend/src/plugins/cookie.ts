import fp from 'fastify-plugin';
import cookie from '@fastify/cookie';

export default fp(async (fastify) => {
    // Register @fastify/cookie first to prevent duplicate registration
    // when @fastify/secure-session tries to register it internally
    await fastify.register(cookie);
});


