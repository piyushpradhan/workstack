import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { prisma } from '../../database/connection.js'
import { ResponseHelper } from '../../utils/response.js'

export default fp(async function (fastify: FastifyInstance) {
  // Get all users
  fastify.get('/users', async (request, reply) => {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
      })
      ResponseHelper.success(reply, users, 'Users retrieved successfully')
    } catch (error) {
      fastify.log.error(error)
      ResponseHelper.error(reply, 'Failed to retrieve users', 500)
    }
  })

  // Get user by ID
  fastify.get('/users/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const user = await prisma.user.findUnique({
        where: { id }
      })
      
      if (!user) {
        ResponseHelper.error(reply, 'User not found', 404)
        return
      }

      ResponseHelper.success(reply, user, 'User retrieved successfully')
    } catch (error) {
      fastify.log.error(error)
      ResponseHelper.error(reply, 'Failed to retrieve user', 500)
    }
  })

  // Create user
  fastify.post('/users', async (request, reply) => {
    try {
      const { email, name, role } = request.body as { email: string; name: string; role?: string }
      
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      
      if (existingUser) {
        ResponseHelper.error(reply, 'User with this email already exists', 409)
        return
      }

      const user = await prisma.user.create({
        data: {
          email,
          name,
          role: role || 'user',
          isActive: true
        }
      })

      ResponseHelper.success(reply, user, 'User created successfully', 201)
    } catch (error) {
      fastify.log.error(error)
      ResponseHelper.error(reply, 'Failed to create user', 500)
    }
  })

  // Update user
  fastify.put('/users/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const { email, name, role } = request.body as { email?: string; name?: string; role?: string }
      
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id }
      })
      
      if (!existingUser) {
        ResponseHelper.error(reply, 'User not found', 404)
        return
      }

      // If email is being updated, check for duplicates
      if (email && email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email }
        })
        if (emailExists) {
          ResponseHelper.error(reply, 'User with this email already exists', 409)
          return
        }
      }

      const user = await prisma.user.update({
        where: { id },
        data: { email, name, role }
      })

      ResponseHelper.success(reply, user, 'User updated successfully')
    } catch (error) {
      fastify.log.error(error)
      ResponseHelper.error(reply, 'Failed to update user', 500)
    }
  })

  // Delete user
  fastify.delete('/users/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      
      const user = await prisma.user.findUnique({
        where: { id }
      })
      
      if (!user) {
        ResponseHelper.error(reply, 'User not found', 404)
        return
      }

      await prisma.user.delete({
        where: { id }
      })

      ResponseHelper.success(reply, null, 'User deleted successfully')
    } catch (error) {
      fastify.log.error(error)
      ResponseHelper.error(reply, 'Failed to delete user', 500)
    }
  })
})
