/**
 * @swagger
 * tags:
 *  name: Usuarios
 *  description: Endpoints para los usuarios
 */

/**
 * @swagger
 * /users:
 *  get:
 *      tags: [Usuarios]
 *      summary: Obtiene la lista con todos los usuarios
 *      response:
 *          200:
 *              description: OK
 *              content:
 *                  application/json:
 *                      type: array
 *          401:
 *              description: No autentucado
 */

/**
 * @swagger
 * /users:
 *  post:
 *      tags: [Usuarios]
 *      summary: Crea un nuevo usuario
 *      response:
 *          201:
 *              description: id del usuario creado
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 */
