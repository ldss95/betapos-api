import { NextFunction, Request, Response } from 'express'
import * as Sentry from '@sentry/node'

export const addExtraData2Sentry = async (err: Error, req: Request, res: Response, next: NextFunction) => {
	await Sentry.configureScope(scope => {
		scope.setExtra('Path', req.path)
		scope.setExtra('Method', req.method)
		scope.setExtra('Body', req.body)
		scope.setExtra('Params', req.params)
		scope.setExtra('Query', req.query)
	})
	Sentry.captureException(err)
	next(err)
}
