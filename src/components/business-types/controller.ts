import { Request, Response } from 'express'

import { BusinessType } from './model'

export default {
	getAll: async (req: Request, res: Response) => {
		const types = await BusinessType.findAll({ order: [['name', 'ASC']] })
		const other = types.find((type) => type.code === 'OTHE')
		res.status(200).send([...types.filter((type) => type.code !== 'OTHE'), other])
	},
	getOne: async (req: Request, res: Response) => {
		const { id } = req.params

		const type = await BusinessType.findOne({ where: { id } })
		res.status(200).send(type)
	}
}
