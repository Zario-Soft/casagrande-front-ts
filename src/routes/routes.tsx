import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./protected-route";
import ErrorPage from "./error-page";
import Login from "src/features/login/login.page";

export enum pageRoutes {
  ALUNOS = '/alunos',
  DESAFIOS = '/desafios',
  LOGIN = '/login'
}

export const router = createBrowserRouter([
    // {
    //   path: pageRoutes.DESAFIOS,
    //   element: (<ProtectedRoute> <Challenges /> </ProtectedRoute>)
    // },
    {
      path: pageRoutes.LOGIN,
      element: <Login />,
    },
    {
      path: '*',
      element: <ErrorPage />
    }
  ]);