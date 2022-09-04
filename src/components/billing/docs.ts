/**
 * @swagger
 * tags:
 *  name: Facturas
 */

/**
 * @swagger
 * /billing:
 *  get:
 *      tags: [Facturas]
 *      summary: Lista todas las facturas, en funcion del rol del usuario, solo mostrara las facturas que tiene permitido ver
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
 *                          type: array
 *                          items:
 *                              type: object
 *                              properties:
 *                                  id:
 *                                      type: string
 *                                      example: 16d4e02a-3cdc-4212-be80-5873763a5165
 *                                  businessId:
 *                                      type: string
 *                                      example: 16d4e02a-3cdc-4212-be80-5873763a5165
 *                                  orderNumber:
 *                                      type: string
 *                                      example: '00000015'
 *                                  uepaPayOrderNumber:
 *                                      type: string
 *                                      example: 4074108
 *                                  uepaPayLink:
 *                                      type: string
 *                                      example: https://uepapay.com/pl.aspx?pl=4972BE1
 *                                  transferVoucherUrl:
 *                                      type: string
 *                                      example: https://i.ibb.co/bBvpMSG/Transferencia-pai.png
 *                                  amount:
 *                                      type: number
 *                                      example: 1000
 *                                  description:
 *                                      type: string
 *                                      example: Pago por uso Beta POS Junio 2022
 *                                  payed:
 *                                      type: boolean
 *                                      example: true
 *                                  payedAt:
 *                                      type: string
 *                                      example: 2022-06-28 11:34:00
 *                                  createdAt:
 *                                      type: string
 *                                      example: 2022-06-28 08:00:00
 *                                  updatedAt:
 *                                      type: string
 *                                      example: 2022-06-28 16:12:00
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
