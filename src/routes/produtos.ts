import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function produtosRoutes(app: FastifyInstance) {
  app.post('/add-product', async (request, reply) => {
    const bodySchema = z.object({
      sku: z.string(),
      supplierId: z.string(),
      name: z.string(),
      description: z.string(),
      price: z.string(),
      cost: z.string(),
      stock: z.number(),
    })

    const { sku, supplierId, name, description, price, cost, stock } =
      bodySchema.parse(request.body)

    try {
      await prisma.products.create({
        data: {
          sku,
          supplierId,
          name,
          description,
          price,
          cost,
          stock,
        },
      })
    } catch (err) {
      console.log(err)

      if (err) return reply.status(500).send({ error: 'Unable to add product' })
    }
  })
}
