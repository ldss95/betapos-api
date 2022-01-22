# ZECONOMY API

ZECONOMY es un sistema de facturación POS y gestion de inventario multi usuarios.

## Documentacion
La documentacion del API es generada con [Swagger JsDoc](https://www.npmjs.com/package/swagger-jsdoc) y [Swagger UI Express](https://www.npmjs.com/package/swagger-ui-express), puedes verla en este [link](http://localhost:3000/docs) despues de iniciar el proyecto usando el siduiente comando.

```sh
npm run dev
```

## Variables de entorno  
  
|   Nombre      |   Tipo de dato    |       Ejemplo     |
|---------------|-------------------|-------------------|
|   `PORT`      |   `Int`           |   `3000`          |
|   `NODE_ENV`  |   `String`        |   `dev`           |
|   `DB_HOST`   |   `String`        |   `localhost`     |
|   `DB_USER`   |   `String`        |   `myself`        |
|   `DB_PASS`   |   `String`        |   `Strong-pass_1` |
|   `DB_NAME`   |   `String`        |   `the_best_db`   |
|   `DB_PORT`   |   `Number`        |   `3306`          |
|   `SECRET_SESSION` | `String`     |   `super-secret`  |
|   `SECRET_TOKEN`   | `String`     |   `super-secret`  |