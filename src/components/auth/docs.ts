/**
 * @swagger
 * tags:
 *  name: Auth
 *  description: Endpoints de autenticacion
 */

/**
 * @swagger
 * /auth/login:
 *  post:
 *      tags: [Auth]
 *      summary: Iniciar sesion
 *      parameters:
 *          - in: body
 *            name: email
 *            description: Correo electronico o nickname
 *            required: true
 *            example: miemail@local.com
 *            schema:
 *                type: string
 *          - in: body
 *            name: password
 *            description: Contraseña
 *            example: super-stron*pass_2
 *            required: true
 *            schema:
 *                type: string
 *      responses:
 *          200:
 *              description: OK
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              token:
 *                                  type: string
 *                                  description: Bearer Token
 *                                  example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 *                              message:
 *                                  type: string
 *                                  description: Mensaje de respuesta del servidor
 *                                  example: Sesion iniciada correctamente
 *                              user:
 *                                  type: object
 *                                  description: Objeto con los datos del usuario logeado
 *                                  properties:
 *                                      firstName:
 *                                          type: string
 *                                          description: Nombres
 *                                          example: Juan Alberto
 *                                      lastName:
 *                                          type: string
 *                                          description: Apellidos
 *                                          example: Ruiz
 *                                      email:
 *                                          type: string
 *                                          description: Correo Electronico
 *                                          example: miemail@local.com
 *                                      roleId:
 *                                          type: string
 *                                          description: Nombres
 *                                          example: 45fe6ce9-d851-4f3d-8cc5-4c96b9f527bc
 *          401:
 *              description: Email o Contraseña incorrecta
 *          500:
 *              description: Error del servidor
 */

/**
 * @swagger
 * /auth/logout:
 *  post:
 *      tags: [Auth]
 *      summary: Cierra sesion
 *      security:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 *      responses:
 *          204: OK
 *          500: Error del servidor
 */

/**
 * @swagger
 * /auth/change-password:
 *  post:
 *      tags: [Auth]
 *      summary: Cambia la contraseña del usuario logueado
 *      parameters:
 *          - in: body
 *            name: oldPassword
 *            description: Contraseña vieja
 *            required: true
 *            schema:
 *                type: string
 *          - in: body
 *            name: newPassword
 *            description: Contraseña nueva
 *            required: true
 *            schema:
 *                type: string
 *      security:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 *      responses:
 *        401: Contraseña incorrecta.
 *        204: OK
 *        500: Error del servidor
 */
