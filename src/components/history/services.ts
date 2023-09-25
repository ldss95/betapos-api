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
	await History.create({ ...history })
}
