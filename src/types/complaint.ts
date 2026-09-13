export type ComplaintType =
  | 'Product Quality'
  | 'Packaging'
  | 'Labeling'
  | 'Efficacy'
  | 'Adverse Event'
  | 'Other';

export type Severity = 'Critical' | 'Major' | 'Minor';
export type Priority = 'Urgent' | 'High' | 'Medium' | 'Low';
export type ComplaintStatus = 'Open' | 'Under Investigation' | 'Resolved' | 'Closed';

export interface ComplaintFormData {
  customer_name: string;
  product_name: string;
  batch_lot_number: string;
  manufacturing_date: string;
  expiry_date: string;
  quantity_affected: string;
  complaint_type: ComplaintType | '';
  description: string;
  severity: Severity | '';
  priority: Priority | '';
}

export interface ComplaintRecord extends ComplaintFormData {
  id: string;
  status: ComplaintStatus;
  created_at: string;
  updated_at: string;
}

export const COMPLAINT_TYPES: ComplaintType[] = [
  'Product Quality',
  'Packaging',
  'Labeling',
  'Efficacy',
  'Adverse Event',
  'Other',
];

export const SEVERITY_LEVELS: Severity[] = ['Critical', 'Major', 'Minor'];
export const PRIORITY_LEVELS: Priority[] = ['Urgent', 'High', 'Medium', 'Low'];

export const emptyFormData: ComplaintFormData = {
  customer_name: '',
  product_name: '',
  batch_lot_number: '',
  manufacturing_date: '',
  expiry_date: '',
  quantity_affected: '',
  complaint_type: '',
  description: '',
  severity: '',
  priority: '',
};
