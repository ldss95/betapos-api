export interface BranchProps {
	id: string;
	name: string;
	address: string;
	location: {
		latitude: number;
		longitude: number;
	};
	phone: string;
	rnc: string;
	businessName: string;
	createdAt: string;
	updatedAt: string;
}
