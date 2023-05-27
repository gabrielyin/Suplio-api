import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function fornecedorRoutes(app: FastifyInstance) {
  app.get('/suppliers', async (request, reply) => {
    const suppliers = await prisma.suppliers.findMany()

    return reply.status(200).send(suppliers)
  })

  app.post('/add-supplier', async (request, reply) => {
    const bodySchema = z.object({
      cnpj: z.string(),
      rsocial: z.string(),
      email: z.string().email(),
      name: z.string(),
      address: z.string(),
    })

    const { cnpj, rsocial, email, name, address } = bodySchema.parse(
      request.body,
    )

    await prisma.suppliers.create({
      data: {
        cnpj,
        rsocial,
        email,
        name,
        address,
      },
    })
  })
}
