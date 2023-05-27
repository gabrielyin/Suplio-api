import 'dotenv/config'

import fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { authRoutes } from './routes/auth'
import { pedidosRoutes } from './routes/pedidos'
import { produtosRoutes } from './routes/produtos'
import { fornecedorRoutes } from './routes/fornecedor'

const app = fastify()

app.register(cors, {
  origin: true,
  allowedHeaders: ['set-cookie', 'content-type'],
  credentials: true,
})

app.register(jwt, {
  secret: 'suplio',
})

app.register(authRoutes)
app.register(pedidosRoutes)
app.register(produtosRoutes)
app.register(fornecedorRoutes)

app
  .listen({
    port: 3333,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log('HTTP server running on http://localhost:3333')
  })
