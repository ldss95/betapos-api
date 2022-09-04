import { BankAttr } from './interface'
import { Bank } from './model'

export async function getAllBanks(): Promise<BankAttr[]> {
	const banks = await Bank.findAll({
		order: [['name', 'ASC']],
		raw: true
	})

	return banks
}
