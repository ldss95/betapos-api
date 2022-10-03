import { BankProps } from './interface'
import { Bank } from './model'

export async function getAllBanks(): Promise<BankProps[]> {
	const banks = await Bank.findAll({
		order: [['name', 'ASC']],
		raw: true
	})

	return banks
}
