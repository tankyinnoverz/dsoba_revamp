import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { Controller, Get, Module } from '@nestjs/common'

@Controller('health')
class HealthController { @Get() getHealth() { return { status: 'ok', service: 'dsoba-api', version: 'v1' } } }
@Module({ controllers: [HealthController] }) class AppModule {}

const app = await NestFactory.create(AppModule)
app.setGlobalPrefix('api/v1')
app.enableVersioning()
await app.listen(Number(process.env.API_PORT ?? 4000))
console.log(`DSOBA API listening on ${await app.getUrl()}`)
