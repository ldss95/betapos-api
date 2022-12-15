import { DataTypes } from 'sequelize'

import { NcfAvailabilityProps, NcfProps, NcfStatusProps, NcfTypeProps } from './interface'
import { db } from '../../database/connection'
import { Business } from '../business/model'

export const Ncf = db.define<NcfProps>('ncf', {
	rnc: {
		type: DataTypes.STRING(11),
		primaryKey: true,
		validate: {
			isNumeric: true
		}
	},
	businessName: {
		type: DataTypes.STRING,
		allowNull: false
	},
	statusId: {
		type: DataTypes.UUID,
		allowNull: false
	}
})

export const NcfStatus = db.define<NcfStatusProps>('ncf_status', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
		validate: {
			isIn: [['ACTIVO', 'DADO DE BAJA', 'SUSPENDIDO', 'ANULADO', 'CESE TEMPORAL', 'RECHAZADO', 'NORMAL']]
		}
	}
})

NcfStatus.sync().then(() => {
	NcfStatus.bulkCreate(
		[
			{ name: 'ACTIVO' },
			{ name: 'DADO DE BAJA' },
			{ name: 'SUSPENDIDO' },
			{ name: 'ANULADO' },
			{ name: 'CESE TEMPORAL' },
			{ name: 'RECHAZADO' },
			{ name: 'NORMAL' }
		],
		{ ignoreDuplicates: true }
	)
})

Ncf.belongsTo(NcfStatus, { foreignKey: 'statusId', as: 'status' })

export const NcfType = db.define<NcfTypeProps>('ncf_type', {
	id: {
		type: DataTypes.STRING(4),
		allowNull: false,
		primaryKey: true
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false
	},
	description: {
		type: DataTypes.TEXT,
		allowNull: false
	}
}, { timestamps: false })

NcfType.sync()
	.then(() => {
		NcfType.bulkCreate([
			{
				id: '01',
				name: 'Factura de Crédito Fiscal',
				description: 'Registran las transacciones comerciales de compra y venta de bienes y/o los que prestan algún servicio. Permiten al comprador o usuario que lo solicite sustentar gastos y costos del ISR o créditos del ITBIS.'
			},
			{
				id: '02',
				name: 'Factura de Consumo',
				description: 'Acreditan la transferencia de bienes, la entrega en uso o la prestación de servicios a consumidores finales. No poseen efectos tributarios, es decir, que no podrán ser utilizados para créditos en el ITBIS y/o reducir gastos y costos del ISR.'
			},
			{
				id: '03',
				name: 'Notas de Débito',
				description: 'Documentos que emiten los vendedores de bienes y/o los que prestan servicios para recuperar costos y gastos, como: intereses por mora, fletes u otros, después de emitido el comprobante fiscal. Sólo podrán ser emitidas al mismo adquiriente o usuario para modificar comprobantes emitidos con anterioridad.'
			},
			{
				id: '04',
				name: 'Notas de Crédito',
				description: 'Documentos que emiten los vendedores de bienes y/ o prestadores de servicios por modificaciones posteriores en las condiciones de venta originalmente pactadas, es decir, para anular operaciones, efectuar devoluciones, conceder descuentos y bonificaciones, corregir errores o casos similares.'
			},
			{
				id: '11',
				name: 'Comprobante de Compras',
				description: 'Documentos emitido por las personas físicas o jurídicas cuando adquieran bienes o servicios de personas no registradas como contribuyentes o que sean autorizados mediante norma general.'
			},
			{
				id: '12',
				name: '​Registro Único de Ingresos',
				description: 'Documento utilizado para registrar un resumen de las transacciones diarias realizadas por las personas físicas o jurídicas a consumidores finales, concentradas fundamentalmente en productos o servicios exentos del ITBIS.'
			},
			{
				id: '13',
				name: 'Comprobante para Gastos Menores',
				description: 'Son aquellos comprobantes emitidos por las personas físicas o jurídicas para sustentar pagos realizados por su personal, sean estos efectuados en territorio dominicano o en el extranjero y en ocasión a las actividades relacionadas al trabajo, tales como: consumibles, pasajes, transporte público, tarifas de estacionamiento y Peajes.'
			},
			{
				id: '14',
				name: 'Comprobante de Regímenes Especiales',
				description: 'Son utilizados para facturar las ventas de bienes o prestación de servicios exentos del ITBIS o ISC a personas físicas o jurídicas acogidas a regímenes especiales de tributación, mediante leyes especiales, contratos o convenios debidamente ratificados por el Congreso Nacional. '
			},
			{
				id: '15',
				name: 'Comprobante Gubernamental',
				description: 'Son utilizados para facturar la venta de bienes y la prestación de servicios al Gobierno Central, Instituciones Descentralizadas y Autónomas, Instituciones de Seguridad Social y cualquier entidad gubernamental que no realice una actividad comercial.'
			},
			{
				id: '16',
				name: 'Comprobante para exportaciones',
				description: 'Son utilizados por los exportadores nacionales; zonas francas comerciales e industriales para reportar las ventas de bienes fuera del territorio nacional. ​'
			},
			{
				id: '17',
				name: 'Comprobante para Pagos al Exterior',
				description: 'Son emitidos por concepto de pago de rentas gravadas de fuente dominicana a personas físicas o jurídicas no residentes fiscales. Al emitir este documento se debe realizar la retención total del Impuesto Sobre la Renta, de conformidad a los artículos 297 y 305 del Código Tributario.'
			},
			{
				id: 'e-CF',
				name: 'Comprobante Fiscal Electrónico',
				description: 'Es un documento electrónico firmado digitalmente, que acredita la transferencia de bienes, entrega en uso o la prestación de servicios, debiendo cumplir siempre con los requisitos establecidos en la normativa dispuesta para estos fines.​​​​​​​​'
			}
		], { ignoreDuplicates: true })
	})

export const NcfAvailability = db.define<NcfAvailabilityProps>('ncf_availability', {
	id: {
		type: DataTypes.UUID,
		defaultValue: DataTypes.UUIDV4,
		primaryKey: true
	},
	businessId: {
		type: DataTypes.UUID,
		allowNull: false
	},
	typeId: {
		type: DataTypes.STRING(4),
		allowNull: false
	},
	startOn: {
		type: DataTypes.INTEGER,
		allowNull: false,
		validate: {
			min: 1,
			max: 99999998
		}
	},
	stopOn: {
		type: DataTypes.INTEGER,
		allowNull: false,
		validate: {
			min: 1,
			max: 99999999
		}
	},
	expireAt: {
		type: DataTypes.DATEONLY,
		allowNull: false
	}
})

NcfAvailability.belongsTo(Business, { foreignKey: 'businessId', as: 'business' })
NcfAvailability.belongsTo(NcfType, { foreignKey: 'typeId', as: 'type' })
