import { Request, Response } from 'express'

import { Client } from './model'
import { deleteFile } from '../../helpers'

export default {
	create: (req: Request, res: Response) => {
		Client.create({ ...req.body, businessId: req.session!.businessId })
			.then(({ id }) => res.status(201).send({ id }))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	update: (req: Request, res: Response) => {
		const { id } = req.body

		Client.update(req.body, { where: { id } })
			.then(() => res.sendStatus(204))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	delete: (req: Request, res: Response) => {
		const { id } = req.params

		Client.destroy({ where: { id } })
			.then(() => res.sendStatus(204))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	getAll: (req: Request, res: Response) => {
		Client.findAll({ where: { businessId: req.session!.businessId } })
			.then((clients) => res.status(200).send(clients))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	getOne: (req: Request, res: Response) => {
		const { id } = req.params

		Client.findOne({ where: { id } })
			.then((model) => res.status(200).send(model))
			.catch((error) => {
				res.sendStatus(500)
				throw error
			})
	},
	addPhoto: async (req: any, res: Response) => {
		try {
			const { file } = req
			let { location } = file
			if (location.substr(0, 8) != 'https://') {
				location = `https://${location}`
			}

			const { id } = req.body

			const client = await Client.findOne({ where: { id } })

			// Delte current photo if exists
			if (client?.photoUrl && client.photoUrl != location) {
				let key = client.photoUrl.split('/images/').pop()
				key = 'images/' + key
				deleteFile(key)
			}

			await client!.update({ photoUrl: location })
			res.status(200).send({ photoUrl: location })
		} catch (error) {
			res.sendStatus(500)
			throw error
		}
	}
}
