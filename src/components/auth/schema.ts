import { z } from 'zod'

export const userSchema = z.object({
	email: z.string().email('Email del usuario invalido'),
	password: z.string().min(6, 'Contraseña muy corta'),
	firstName: z.string().min(3, 'Nombre invalido'),
	lastName: z.string().min(3, 'Nombre invalido'),
	gender: z.enum(['M', 'F', 'O']),
	birthDate: z.string().min(10).max(10).optional()
})

export const businessSchema = z.object({
	name: z.string().min(2),
	typeId: z.string(),
	provinceId: z.string(),
	phone: z.string().min(16).max(16).optional()
})
