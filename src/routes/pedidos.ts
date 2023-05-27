import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function pedidosRoutes(app: FastifyInstance) {
  app.get('/orders', async (request, reply) => {
    return reply.send('pedidos')
  })

  app.post('/create-order', async (request, reply) => {
    const bodySchema = z.object({
      name: z.string(),
      amount: z.number(),
      status: z.string(),
      email: z.string().email(),
    })

    const { name, amount, status, email } = bodySchema.parse(request.body)

    try {
      await prisma.orders.create({
        data: {
          name,
          amount,
          Status: status,
          email,
        },
      })

      return reply.status(201).send()
    } catch (err) {
      if (err)
        return reply.status(500).send({ error: 'Unable to create order' })
    }
  })
}
