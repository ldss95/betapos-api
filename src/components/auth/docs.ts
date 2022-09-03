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
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          email:
 *                              description: Correo electronico o nickname
 *                              required: true
 *                              example: miemail@local.com
 *                              type: string
 *                          password:
 *                              description: Contraseña
 *                              example: super-stron*pass_2
 *                              required: true
 *                              type: string
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
 *                                          description: Id del rol del usuario
 *                                          example: 45fe6ce9-d851-4f3d-8cc5-4c96b9f527bc
 *                                      id:
 *                                          type: string
 *                                          description: Id del usuario
 *                                          example: 7db3422d-3f8b-4138-a4f8-2297d6fb0ea9
 *                                      businessId:
 *                                          type: string
 *                                          description: Id de la empresa a la que pertenece el usuario (si aplica)
 *                                          example: 2c688872-1fd6-48e2-8dd0-ee490e8b1b48
 *                                      photoUrl:
 *                                          type: string
 *                                          description: URL de la foto del usuario
 *                                          example: https://dl.memuplay.com/new_market/img/com.vicman.newprofilepic.icon.2022-06-07-21-33-07.png
 *                                      roleCode:
 *                                          type: string
 *                                          description: Codigo que indica el rol del usuario
 *                                          example: BIOWNER
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
 *          204:
 *              description: OK
 *          500:
 *              description: Error del servidor
 */

/**
 * @swagger
 * /auth/change-password:
 *  post:
 *      tags: [Auth]
 *      summary: Cambia la contraseña del usuario logueado
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          oldPassword:
 *                              description: Contraseña vieja
 *                              required: true
 *                              type: string
 *                              example: current-password
 *                          newPassword:
 *                              description: Contraseña nueva
 *                              required: true
 *                              type: string
 *                              example: new-password
 *      security:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 *      responses:
 *          401:
 *              description: Contraseña incorrecta.
 *          204:
 *              description: OK
 *          500:
 *              description: Error del servidor
 */

/**
 * @swagger
 * /auth/current-session:
 *  get:
 *      tags: [Auth]
 *      summary: Obtiene los datos de la sesion
 *      responses:
 *        200:
 *            description: OK
 *            content:
 *                application/json:
 *                    schema:
 *                        type: object
 *                        properties:
 *                            session:
 *                                type: object
 *                                description: Sesion actual
 *                                properties:
 *                                    loggedin:
 *                                        type: boolean
 *                                        description: Indica si hay una sesion iniciada
 *                                    name:
 *                                        type: string
 *                                        descriptin: Nombre del usuario logueado
 *                                        example: Jhon Doe
 *                                    photo:
 *                                        type: string
 *                                        description: Url de la foto del usuario logueado
 *                                        example: https://dl.memuplay.com/new_market/img/com.vicman.newprofilepic.icon.2022-06-07-21-33-07.png
 *                                    email:
 *                                        type: string
 *                                        description: Correo electronico del usuario logueado
 *                                        example: jdoe@local.com
 *                                    roleId:
 *                                        type: string
 *                                        description: Id del rol del usuario
 *                                        example: 93aa8def-1eae-4c84-956b-ed19051b7b68
 *                                    roleCode:
 *                                        type: string
 *                                        description: Codigo del rol del usuario
 *                                        example: ADMIN
 *                                    businessId:
 *                                        type: string
 *                                        description: Id de la empresa a la que pertenece el usuario
 *                                        example: 93aa8def-1eae-4c84-956b-ed19051b7b68
 *                                    merchantId:
 *                                        type: string
 *                                        description: Merchant ID de la empresa a la que pertenece el usuario
 *                                        example: AA0000
 *                                    userId:
 *                                        type: string
 *                                        description: Id del usuario
 *                                        example: 93aa8def-1eae-4c84-956b-ed19051b7b68
 */
