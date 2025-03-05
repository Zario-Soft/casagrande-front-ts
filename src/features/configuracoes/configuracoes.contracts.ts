export interface UsuarioDTO {
    id: number;
    login: string;
    allowed_routes: string[];
    password: string;
    confirmPassword: string;
    is_admin: boolean;
}

export type UsuarioResponse = Omit<UsuarioDTO, 'is_admin' | 'allowed_routes'> & {
    isadmin: boolean;
    allowed_routes: string;
}

export type UsuarioRequest = Omit<UsuarioDTO, 'is_admin' | 'allowed_routes' | 'password' | 'confirmPassword'> & {
    isadmin: boolean;
    allowed_routes: string;
    nome: string;
    secret: string | undefined;
}