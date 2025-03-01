export interface UsuarioDTO {
    id: number;
    login: string;
    allowed_routes: string[];
    password: string;
    confirmPassword: string;
    is_admin: boolean;
}

export type UsuarioResponse = Omit<UsuarioDTO, 'is_admin'> & {
    isadmin: boolean;
}