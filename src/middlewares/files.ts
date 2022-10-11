import { Request } from 'express'
import multer from 'multer'
import multerS3 from 'multer-s3'
import aws from 'aws-sdk'

const { S3_ENDPOINT, BUCKET_NAME } = process.env

const spaceEndpoint = new aws.Endpoint(S3_ENDPOINT!)
const s3 = new aws.S3({ endpoint: spaceEndpoint })

const uploadSingle = (path: string, key = 'image') =>
	multer({
		storage: multerS3({
			s3,
			bucket: BUCKET_NAME!,
			acl: 'public-read',
			contentType: multerS3.AUTO_CONTENT_TYPE,
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
		bucket: BUCKET_NAME!,
		acl: 'public-read',
		contentType: multerS3.AUTO_CONTENT_TYPE,
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
