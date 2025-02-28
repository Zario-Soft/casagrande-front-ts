export interface UsuarioDTO {
    id: number;
    login: string;
    isadmin: boolean;
    permissions: string[];
    password: string;
    confirmPassword: string;
}


export interface UsuarioResponse {
    id: number;
    login: string;
    isadmin: boolean;
    permissions: string[];
}


