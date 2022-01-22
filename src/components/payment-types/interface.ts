import { Model } from 'sequelize'

export interface PaymentTypeAttr extends Model {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
