<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# CivicVoice API

A daily civic polling platform backend built with **NestJS**, **Prisma**, and **PostgreSQL**. One poll is active at a time—citizens vote anonymously, and admins manage the full poll lifecycle.

## Key Features

- 🗳️ **Anonymous Voting** - No sign-up required, voter privacy protected via SHA-256 hashing
- 👨‍💼 **Admin Dashboard** - Full control over poll lifecycle (DRAFT → ACTIVE → CLOSED)
- 🔐 **JWT Authentication** - Secure admin endpoints with Bearer tokens
- 🤖 **Auto-Close Polls** - Cron job automatically closes polls past their `closesAt` time
- 📊 **Real-time Results** - Public API to fetch poll results and vote counts
- 📖 **Swagger UI** - Full API documentation with interactive testing at `/api/docs`
- 🔄 **Type-Safe Database** - Prisma ORM with migrations and seeding

## Quick Links

- 📘 **[Deployment Guide](./RENDER_DEPLOYMENT.md)** - Deploy to Render with one click
- 🚀 **[API Documentation](http://localhost:3000/api/docs)** - Interactive Swagger docs
- 📦 **[Prisma Schema](./prisma/schema/schema.prisma)** - Database models



## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

### Deploy to Render (Recommended)

This project is optimized for deployment on [Render](https://render.com/), a modern cloud platform.

**Quick Start:**
1. Push your code to GitHub
2. Connect your repository to Render
3. Render will automatically detect `render.yaml` and configure everything

For detailed instructions, see [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md).

**Environment Variables Required:**
- `DATABASE_URL` - PostgreSQL connection string (auto-linked via render.yaml)
- `JWT_SECRET` - Generate with: `openssl rand -base64 32`
- `ALLOWED_ORIGINS` - Comma-separated list of frontend URLs
- `NODE_ENV` - Set to `production`

Other cloud options:
- [NestJS Deployment Guide](https://docs.nestjs.com/deployment)
- [Vercel](https://vercel.com/) (for edge functions)
- [AWS](https://aws.amazon.com/)
- [Heroku](https://www.heroku.com/) (if still in production)

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
