import { useAppSelector } from "src/redux-ts/hooks";
import { selectUserInfo } from "src/redux-ts/slices/auth.slice";
import CadastroUsuario from "./config-usuario.page";
import Cor from "./cor/cor.page";

export default function Configuracoes() {
    const isAdmin = !!useAppSelector(selectUserInfo)?.is_admin;

    return <>
        <div>
            {isAdmin && <CadastroUsuario />}
            <Cor />
        </div>
    </>
}
