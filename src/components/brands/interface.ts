import { Model } from 'sequelize'

export interface BrandAttr extends Model {
  id: string;
  businessId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
