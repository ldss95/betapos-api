import { createTransport } from 'nodemailer'
import { MailOptions } from 'nodemailer/lib/json-transport'

const { EMAIL_ACCOUNT, EMAIL_PASSWORD } = process.env

const transporter = createTransport({
	service: 'gmail',
	auth: {
		user: EMAIL_ACCOUNT,
		pass: EMAIL_PASSWORD,
	},
})

export const verifyConnection = async () => {
	return await transporter.verify()
}

interface SendEmailProps {
	from?: string,
	to: string | string[],
	subject: string,
	html: string,
	options?: MailOptions
}

export const sendEmail = async ({ from = `"Beta POS" <${EMAIL_ACCOUNT}>`, options, ...props }: SendEmailProps) => {
	return await transporter.sendMail({
		from,
		...props,
		...options
	})
}
