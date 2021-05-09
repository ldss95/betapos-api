/**
 * Establece los valores iniciales de una tabla
 */
async function loadInitialData(model: any, initialValue: Object | Object[]) {
	try {
		const types = await model.findAll()
        if (types.length == 0) {
            if (initialValue instanceof Array) {
                await model.bulkCreate(initialValue)
            } else {
                await model.create(initialValue)
            }
        }
	} catch (error) {
		throw error
	}
}

export { loadInitialData }