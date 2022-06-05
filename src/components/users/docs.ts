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
 *      responses:
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
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          firstName:
 *                              type: string
 *                              description: Nombres del usuario
 *                              required: true
 *                          lastName:
 *                              type: string
 *                              description: Apellidos del usuario
 *                              required: true
 *                          email:
 *                              type: string
 *                              description: Email del usuario
 *                              required: true
 *                              format: email
 *                          birthDate:
 *                              type: string
 *                              description: Fecha de nacimiento del usuario
 *                              required: false
 *                              format: date
 *                          nickName:
 *                             type: string
 *                             description: Nickname del usuario
 *                             required: false
 *                          password:
 *                             type: string
 *                             description: Contraseña del usuario
 *                             required: true
 *                          dui:
 *                             type: string
 *                             description: Cédula del usuario
 *                             required: false
 *                             example: 402-4719912-2
 *                          address:
 *                             type: string
 *                             description: Dirección del usuario
 *                             required: false
 *                          photoUrl:
 *                             type: string
 *                             description: Url de la foto del usuario
 *                             required: false
 *                             format: url
 *                          roleId:
 *                             type: string
 *                             description: ID del rol asignado
 *                             required: true
 *                             format: uuid
 *                          businessId:
 *                             type: string
 *                             description: ID de la empresa a la que pertenece el usuario
 *                             required: false
 *                             format: uuid
 *                          isActive:
 *                             type: boolean
 *                             description: Estado del usuario
 *                             required: true
 *      responses:
 *          201:
 *              description: Usuario creado con exito
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                             id:
 *                                 type: string
 *                                 description: Id del usuario
 *                                 format: uuid
 */
