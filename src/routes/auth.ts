import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcrypt'

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request, reply) => {
    const bodySchema = z.object({
      account: z.string(),
      cpf: z.string(),
      email: z.string(),
      role: z.string().default('Team'),
      password: z.string(),
    })

    const { account, cpf, email, password, role } = bodySchema.parse(
      request.body,
    )

    try {
      const user = await prisma.user.create({
        data: {
          account,
          cpf,
          email,
          password: await bcrypt.hash(password, 10),
          role,
        },
      })

      const token = app.jwt.sign(
        {
          email: user.email,
        },
        {
          sub: user.id,
          expiresIn: '7 days',
        },
      )

      try {
        await prisma.session.create({
          data: {
            userId: user.id,
            accessToken: token,
          },
        })
      } catch (err) {
        console.log(err)
      }

      const expireInMilliseconds = 60 * 60 * 24 * 7

      return reply
        .status(200)
        .header(
          'set-cookie',
          `token=${token}; Path=/; max-age=${expireInMilliseconds}; HttpOnly`,
        )
        .send()
    } catch (error) {
      if (error)
        return reply.status(409).send({ error: 'Unable to create user' })
    }
  })

  app.post('/login', async (request, reply) => {
    const bodySchema = z.object({
      email: z.string(),
      password: z.string(),
    })

    const userInfo = bodySchema.parse(request.body)

    const user = await prisma.user.findFirst({
      where: {
        email: userInfo.email,
      },
    })

    if (user) {
      const isAuthenticated = await bcrypt.compare(
        userInfo.password,
        user.password,
      )
      if (isAuthenticated) {
        const token = app.jwt.sign(
          {
            email: user.email,
          },
          {
            sub: user.id,
            expiresIn: '7 days',
          },
        )

        await prisma.session.update({
          where: {
            userId: user.id,
          },
          data: {
            accessToken: token,
          },
        })

        const expireInMilliseconds = 60 * 60 * 24 * 7

        return reply
          .status(200)
          .header(
            'set-cookie',
            `token=${token}; Path=/; max-age=${expireInMilliseconds}; HttpOnly`,
          )
          .send()
      } else {
        return reply.status(400).send({ error: 'User not found' })
      }
    } else {
      return reply.status(400).send({ error: 'User not found' })
    }
  })

  app.get('/validate-token', async (request, reply) => {
    await request.jwtVerify()

    const token: string = request.headers.authorization!.slice(7)

    const response = await prisma.session.findFirst({
      where: {
        accessToken: token,
      },
    })

    if (!response) {
      return reply.status(401).send({ error: 'Unauthorized request' })
    }

    const decodedTokenSchema = z.object({
      email: z.string(),
      sub: z.string().uuid(),
      iat: z.number(),
      exp: z.number(),
    })

    const decodedToken = decodedTokenSchema.parse(app.jwt.decode(token))

    const { sub: id, email } = decodedToken

    try {
      const response = await prisma.user.findFirst({
        where: {
          id,
          email,
        },
      })

      return reply.status(200).send({ role: response?.role })
    } catch (err) {
      return reply.status(401).send({ error: 'Unauthorized request' })
    }
  })
}
