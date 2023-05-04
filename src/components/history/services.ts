import { sendEmail } from '../../utils/emails'
import { ClientProps } from '../clients/interface'
import { ProductProps } from '../products/interface'
import { Table } from './interface'
import { History } from './model'

interface SaveHistoryProps {
	before?: object;
	after?: object;
	ip?: string;
	agent?: string;
	table: Table;
	userId: string;
	identifier: string;
}

export async function saveHistory(history: SaveHistoryProps) {
	await History.create(history)
	const to = 'jordany.jpa@gmail.com'

	if (history.userId === 'b337b592-4caa-11ed-bef0-d52c5e528293' && history.table === Table.PRODUCTS) {
		const before = history.before as ProductProps
		const after = history.after as ProductProps
		sendEmail({
			to,
			html: `
				<html>
					<head>
						<style>
							h1, h4 {
								font-family: Arial, sans-serif;
								font-weight: bold;
								margin-bottom: 10px;
							}

							table {
								border-collapse: collapse;
								width: 100%;
								margin-bottom: 20px;
							}

							th, td {
								padding: 8px;
								text-align: left;
								vertical-align: top;
								border: 1px solid #ddd;
								font-size: 14px;
							}

							th {
								background-color: #f2f2f2;
							}

							td {
								font-family: Arial, sans-serif;
							}

							tbody tr:nth-child(even) {
								background-color: #f9f9f9;
							}

							p {
								margin: 0;
								font-family: Arial, sans-serif;
								font-size: 14px;
								line-height: 1.5;
							}

							b {
								font-weight: bold;
							}
						</style>
					</head>
					<body>
						<h1>Producto Modificado</h1>
						<br />

						<p>Nombre: <b>${before.name}</b></p>
						<p>ID: <b>${before.id}</b></p>
						<p>IP: <b>${history.ip}</b></p>
						<br />

						<h4>Antes</h4>
						<table>
							<thead>
								<tr>
									<th>Nombre</th>
									<th>Códigos de barra</th>
									<th>Código de referencia</th>
									<th>Costo</th>
									<th>Precio</th>
									<th>Precio de negocio</th>
									<th>% de ganancia</th>
									<th>Se vende pesado</th>
								</tr>
							<thead>
							<tbody>
								<tr>
									<td>${before.name}</td>
									<td>${(before?.barcodes || []).map(({ barcode }) => barcode).join(', ')}</td>
									<td>${before?.referenceCode || ''}</td>
									<td>${before.cost}</td>
									<td>${before.price}</td>
									<td>${before?.businessPrice || 'N/A'}</td>
									<td>${before.profitPercent}</td>
									<td>${before.isFractionable ? 'Si' : 'No'}</td>
								</tr>
							</tbody>
						</table>
						<br />

						<h4>Despues</h4>
						<table>
							<thead>
								<tr>
									<th>Nombre</th>
									<th>Códigos de barra</th>
									<th>Código de referencia</th>
									<th>Costo</th>
									<th>Precio</th>
									<th>Precio de negocio</th>
									<th>% de ganancia</th>
									<th>Se vende pesado</th>
								</tr>
							<thead>
							<tbody>
								<tr>
									<td>${after.name}</td>
									<td>${(after?.barcodes || []).map(({ barcode }) => barcode).join(', ')}</td>
									<td>${after?.referenceCode || ''}</td>
									<td>${after.cost}</td>
									<td>${after.price}</td>
									<td>${after?.businessPrice || 'N/A'}</td>
									<td>${after.profitPercent || 'N/A'}</td>
									<td>${after.isFractionable ? 'Si' : 'No'}</td>
								</tr>
							</tbody>
						</table>
					</body>
				</html>
			`,
			subject: 'Producto modificado'
		})
	}

	if (history.userId === 'b337b592-4caa-11ed-bef0-d52c5e528293' && history.table === Table.CLIENTS) {
		const before = history.before as ClientProps
		const after = history.after as ClientProps
		sendEmail({
			to,
			html: `
				<html>
					<head>
						<style>
							h1, h4 {
								font-family: Arial, sans-serif;
								font-weight: bold;
								margin-bottom: 10px;
							}

							table {
								border-collapse: collapse;
								width: 100%;
								margin-bottom: 20px;
							}

							th, td {
								padding: 8px;
								text-align: left;
								vertical-align: top;
								border: 1px solid #ddd;
								font-size: 14px;
							}

							th {
								background-color: #f2f2f2;
							}

							td {
								font-family: Arial, sans-serif;
							}

							tbody tr:nth-child(even) {
								background-color: #f9f9f9;
							}

							p {
								margin: 0;
								font-family: Arial, sans-serif;
								font-size: 14px;
								line-height: 1.5;
							}

							b {
								font-weight: bold;
							}
						</style>
					</head>
					<body>
						<h1>Cliente Modificado</h1>
						<br />

						<p>Nombre: <b>${before.name}</b></p>
						<p>ID: <b>${before.id}</b></p>
						<p>IP: <b>${history.ip}</b></p>
						<br />

						<h4>Antes</h4>
						<table>
							<thead>
								<tr>
									<th>Nombre</th>
									<th>Cédula</th>
									<th>Grupo</th>
									<th>Tiene credito</th>
									<th>Limite de credito</th>
								</tr>
							<thead>
							<tbody>
								<tr>
									<td>${before.name}</td>
									<td>${before.dui || ''}</td>
									<td>${before.groupId || 'N/A'}</td>
									<td>${before.hasCredit ? 'Si' : 'No'}</td>
									<td>${before.creditLimit || 0}</td>
								</tr>
							</tbody>
						</table>
						<br />

						<h4>Despues</h4>
						<table>
							<thead>
								<tr>
									<th>Nombre</th>
									<th>Cédula</th>
									<th>Grupo</th>
									<th>Tiene credito</th>
									<th>Limite de credito</th>
								</tr>
							<thead>
							<tbody>
								<tr>
									<td>${after.name}</td>
									<td>${after.dui || ''}</td>
									<td>${after.groupId || 'N/A'}</td>
									<td>${after.hasCredit ? 'Si' : 'No'}</td>
									<td>${after.creditLimit || 0}</td>
								</tr>
							</tbody>
						</table>
					</body>
				</html>
			`,
			subject: 'Cliente modificado'
		})
	}
}
