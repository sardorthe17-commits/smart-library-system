import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { cookieSeceret } from './core/configs/cookie-config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import hbs from 'hbs';
import { getPort } from './core/configs/port.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableShutdownHooks();

  // HBS sozlash
  app.useStaticAssets(join(__dirname, '..', 'public')); 

  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  hbs.registerPartials(join(__dirname, '..', 'views', 'partials'));
  hbs.registerPartials(join(__dirname, '..', 'views', 'admin'));
  hbs.registerPartials(join(__dirname, '..', 'views', 'home'));
  hbs.registerPartials(join(__dirname, '..', 'views', 'regist-and-login'));

  hbs.registerHelper('eq', function (a, b) {
    return a === b;
  });

  hbs.registerHelper('gt', function (a, b) {
    return a > b;
  });

  app.useBodyParser('urlencoded', { extended: true });
  app.useBodyParser('json');
  app.use(cookieParser(cookieSeceret()));
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  const port = getPort();
  await app.listen(port, () => {
    console.log(`localhost:${port}`);
  });
}
process.on('unhandledRejection', (reason) => {
  console.error('⚠️ Unhandled Rejection (ilova davom etmoqda):', reason);
});
bootstrap();