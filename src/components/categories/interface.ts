import { Model } from 'sequelize'

export interface CategoryAttr extends Model {
  id: string;
  businessId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
