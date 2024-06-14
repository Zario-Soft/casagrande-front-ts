import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./protected-route";
import ErrorPage from "./error-page";
import Login from "src/features/login/login.page";
import Clientes from "src/features/clientes/clientes.page";

export enum pageRoutes {
  CALENDARIO = '/calendario',
  CLIENTES = '/clientes',
  CONFIGURACOES = '/configuracoes',
  LOGIN = '/login',
  ORCAMENTOS = '/orcamentos',
  PRODUCAO = '/producao',
  PRODUTOS = '/produtos',
  VENDAS = '/vendas',
}

export const router = createBrowserRouter([
  {
    path: pageRoutes.CLIENTES,
    element: (<ProtectedRoute> <Clientes /> </ProtectedRoute>)
  },
  {
    path: pageRoutes.LOGIN,
    element: <Login />,
  },
  {
    path: '*',
    element: <ErrorPage />
  }
]);