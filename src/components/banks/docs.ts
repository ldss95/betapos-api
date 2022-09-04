/**
 * @swagger
 * tags:
 *  name: Bancos
 */

/**
 * @swagger
 * /banks:
 *  get:
 *      tags: [Bancos]
 *      summary: Obtiene la lista de bancos
 *      responses:
 *          200:
 *              description: OK
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              type: object
 *                              properties:
 *                                  id:
 *                                      type: string
 *                                      example: 16c3a5b7-8ff3-489d-ae90-c66de7610db3
 *                                  name:
 *                                      type: string
 *                                      example: Banco Popular Dominicano
 *                                  createdAt:
 *                                      type: string
 *                                      example: 2022-01-01 08:00:00
 *                                  updatedAt:
 *                                      type: string
 *                                      example: 2022-01-01 08:00:00
 *          401:
 *              description: No autenticado
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  description: Mensaje explicando que pasó
 *                                  example: Ninguna sesion iniciada
 *
 */
