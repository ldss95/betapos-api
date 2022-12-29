import { NextFunction, Request, Response } from 'express'

import { BusinessType } from './model'

export default {
	getAll: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const types = await BusinessType.findAll({ order: [['name', 'ASC']] })
			const other = types.find((type) => type.code === 'OTHE')
			res.status(200).send([...types.filter((type) => type.code !== 'OTHE'), other])
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	},
	getOne: async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { id } = req.params

			const type = await BusinessType.findOne({ where: { id } })
			res.status(200).send(type)
		} catch (error) {
			res.sendStatus(500)
			next(error)
		}
	}
}
