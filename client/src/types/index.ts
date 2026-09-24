export * from '../../../shared/schemas.js';

export interface UserSession {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string | null;
}

export type WorkspaceTab = 'evidence' | 'timeline' | 'dossier' | 'recovery';
