import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./protected-route";
import ErrorPage from "./error-page";
import Login from "src/features/login/login.page";
import Clientes from "src/features/clientes/clientes.page";
import Produtos from "src/features/produtos/produtos.page";
import Orcamentos from "src/features/orcamentos/orcamentos.page";
import Vendas from "src/features/vendas/vendas.page";
import Calendario from "src/features/calendario/calendario.page";

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
    path: pageRoutes.CALENDARIO,
    element: (<ProtectedRoute> <Calendario /> </ProtectedRoute>)
  },  
  {
    path: pageRoutes.CLIENTES,
    element: (<ProtectedRoute> <Clientes /> </ProtectedRoute>)
  },
  {
    path: pageRoutes.PRODUTOS,
    element: (<ProtectedRoute> <Produtos /> </ProtectedRoute>)
  },
  {
    path: pageRoutes.ORCAMENTOS,
    element: (<ProtectedRoute> <Orcamentos /> </ProtectedRoute>)
  },
  {
    path: pageRoutes.VENDAS,
    element: (<ProtectedRoute> <Vendas /> </ProtectedRoute>)
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