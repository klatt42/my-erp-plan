export type DocumentType = 'floor_plan' | 'contact_list' | 'equipment_inventory' | 'existing_plan' | 'other';
export type DocumentStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type ExtractionType = 'contacts' | 'equipment' | 'floor_plan' | 'procedures' | 'facility_info';

export interface DocumentUpload {
  id: string;
  org_id: string;
  uploaded_by: string;

  // File metadata
  file_name: string;
  file_size: number;
  file_type: 'pdf' | 'docx' | 'xlsx' | 'image';
  mime_type: string;
  storage_path: string;

  // Processing status
  status: DocumentStatus;
  processing_error?: string;

  // Extracted content
  extracted_text?: string;
  extracted_data?: Record<string, any>;

  // Document classification
  document_type?: DocumentType;
  confidence_score?: number;

  // Timestamps
  created_at: string;
  updated_at: string;
  processed_at?: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;

  file_name: string;
  storage_path: string;

  changes_description?: string;
  created_by: string;
  created_at: string;
}

export interface DocumentExtraction {
  id: string;
  document_id: string;
  org_id: string;

  extraction_type: ExtractionType;
  extracted_data: Record<string, any>;

  applied_to_plan: boolean;
  applied_at?: string;
  applied_by?: string;

  model_used?: string;
  tokens_used?: number;
  confidence_score?: number;

  created_at: string;
}

// Extraction result interfaces
export interface ContactExtraction {
  name: string;
  title?: string;
  phone?: string;
  email?: string;
  role?: string;
  department?: string;
}

export interface EquipmentExtraction {
  name: string;
  category?: string;
  quantity?: number;
  location?: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  maintenance_schedule?: string;
}

export interface FloorPlanExtraction {
  building_name?: string;
  floor_number?: string;
  total_area?: number;
  rooms: Array<{
    name: string;
    type?: string;
    area?: number;
    capacity?: number;
  }>;
  exits: Array<{
    location: string;
    type?: string;
  }>;
  safety_equipment: Array<{
    type: string;
    location: string;
  }>;
}

export interface ProcedureExtraction {
  title: string;
  category?: string;
  steps: string[];
  responsible_party?: string;
  frequency?: string;
}

export interface FacilityInfoExtraction {
  facility_name?: string;
  address?: string;
  building_type?: string;
  square_footage?: number;
  number_of_floors?: number;
  occupancy?: number;
  operating_hours?: string;
  utilities?: Array<{
    type: string;
    provider?: string;
    account_number?: string;
    phone?: string;
  }>;
}
