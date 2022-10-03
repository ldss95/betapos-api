export class CustomError {
	public readonly message: string

	constructor({ message }: { message: string }) {
		this.message = message
	}
}
