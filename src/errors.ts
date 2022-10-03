export class CustomError {
	public readonly message: string
	public readonly status: number

	constructor({ message, status }: { message: string; status?: number }) {
		this.message = message
		this.status = status ?? 400
	}
}
