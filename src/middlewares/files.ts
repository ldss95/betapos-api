import { Request } from 'express'
import multer from 'multer'
import multerS3 from 'multer-s3'
import { S3Client } from '@aws-sdk/client-s3'

const { AWS_BUCKET_NAME, AWS_REGION } = process.env
const s3 = new S3Client({
	region: AWS_REGION,

}) as any

const uploadSingle = (path: string, key = 'image') =>
	multer({
		storage: multerS3({
			s3,
			bucket: AWS_BUCKET_NAME!,
			contentType: multerS3.AUTO_CONTENT_TYPE,
			acl: 'public-read',
			metadata: (_, { fieldname }, callback) => {
				callback(null, { fieldname })
			},
			key: (req: Request, file, callback) => {
				const { originalname } = file
				const { name } = req.body

				callback(null, `${path}${name || originalname}`)
			}
		})
	}).single(key)

const uploadMultiple = multer({
	storage: multerS3({
		s3,
		bucket: AWS_BUCKET_NAME!,
		contentType: multerS3.AUTO_CONTENT_TYPE,
		acl: 'public-read',
		metadata: (_, { fieldname }, callback) => {
			callback(null, { fieldname })
		},
		key: (req: Request, file, callback) => {
			const { originalname } = file
			const { path } = req.body

			callback(null, `${path}${originalname}`)
		}
	})
}).any()

export { uploadSingle, uploadMultiple }
