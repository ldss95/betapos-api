import { Model } from 'sequelize'

export interface BarcodeAttr extends Model {
  id: string;
  barcode: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
}
