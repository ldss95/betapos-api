/**
 * @swagger
 * tags:
 *  name: Codigos de barras
 */

/**
 * @swagger
 * /updates/{date}:
 *  get:
 *      tags: [Codigos de barras]
 *      summary: Obtiene la lista de codigos de barras que han sido creados o modificados a partir de una fecha
 *      security:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 *      responses:
 *          200:
 *              description: OK
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              created:
 *                                  type: array
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          id:
 *                                              type: string
 *                                              example: 16d4e02a-3cdc-4212-be80-5873763a5165
 *                                          barcode:
 *                                              type: string
 *                                              example: 16d4e02a-3cdc-4212-be80-5873763a5165
 *                                          productId:
 *                                              type: string
 *                                              example: 16d4e02a-3cdc-4212-be80-5873763a5165
 *                              updated:
 *                                  type: array
 *                                  items:
 *                                      type: object
 *                                      properties:
 *                                          id:
 *                                              type: string
 *                                              example: 16d4e02a-3cdc-4212-be80-5873763a5165
 *                                          barcode:
 *                                              type: string
 *                                              example: 16d4e02a-3cdc-4212-be80-5873763a5165
 *                                          productId:
 *                                              type: string
 *                                              example: 16d4e02a-3cdc-4212-be80-5873763a5165
 *          500:
 *              description: Error del servidor
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
