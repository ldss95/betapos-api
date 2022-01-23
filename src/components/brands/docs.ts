/**
 * @swagger
 * tags:
 *  name: Marcas
 *  description: Endpoints para las marcas
 */

/**
 * @swagger
 * /brands:
 *  get:
 *      summary: Obtiene la lista con todas las marcas
 *      tags: [Marcas]
 *      responses:
 *          200:
 *              description: OK
 *              content:
 *                  application/json:
 *                      type: array
 *          401:
 *              description: No autenticado
 */

/**
 * @swagger
 * /brands:
 *  get:
 *      summary: Obtiene los datos para 1 marca especifica
 *      tags: [Marcas]
 *      responses:
 *          200:
 *              description: OK
 *              content:
 *                  application/json:
 *                      type: object
 *          401:
 *              description: No autenticado
 */

/**
 * @swagger
 * /brands:
 *  post:
 *      summary: Crea una nueva marca
 *      tags: [Marcas]
 *      parameters:
 *          - in: body
 *            name: name
 *            description: Nombre de la marca
 *            required: true
 *            schema:
 *                type: string
 *      responses:
 *          201:
 *              description: Marca creada
 *          400:
 *              description: Nombre duplicado
 *          401:
 *              description: No autenticado
 */

/**
 * @swagger
 * /brands:
 *  delete:
 *      summary: Elimina una marca
 *      tags: [Marcas]
 *      parameters:
 *          - in: path
 *            name: id
 *            description: Id de la marca a eliminar
 *            required: true
 *            schema:
 *                type: string
 *      responses:
 *          204:
 *              description: Marca elimnada
 *          404:
 *              description: Marca no puede ser eliminada porque esta en uso
 *          401:
 *              description: No autenticado
 */

/**
 * @swagger
 * /brands:
 *  put:
 *      summary: Modifica una marca existente
 *      tags: [Marcas]
 *      parameters:
 *          - in: body
 *            name: id
 *            description: Id de la marca a modificar
 *            required: true
 *            schema:
 *                type: string
 *          - in: body
 *            name: name
 *            description: Nuevo nombre de la marca
 *            required: true
 *            schema:
 *                type: string
 *      responses:
 *          204:
 *              description: Marca elimnada
 *          400:
 *              description: Marca no puede ser eliminada porque esta en uso
 *          401:
 *              description: No autenticado
 */
