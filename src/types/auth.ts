export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface PublicAuthUser {
  avatarUrl?: string;
  currentOrgId?: string;
  displayName: string;
  email?: string;
  id: string;
  isSuperAdmin?: boolean;
  orgRole?: string;
  phone?: string;
  portalOrgRole?: string;
}

export interface PublicAuthOrganization {
  id: string;
  name: string;
}

export interface PublicAuthState {
  organization?: PublicAuthOrganization;
  status: AuthStatus;
  user?: PublicAuthUser;
}
