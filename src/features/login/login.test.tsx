import { render, screen } from "@testing-library/react";
import { BrowserRouter, useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "src/providers/auth.provider";
import { LoadingContext } from "src/providers/loading.provider";
import Login from "./login.page";

jest.mock('src/components/top-bar/top-bar.index', () => () => <div data-testid="top-bar" />);


jest.mock('react-toastify');
jest.mock('./login.service', () => {
  return jest.fn().mockImplementation(() => {
    return {
      doLogin: jest.fn().mockResolvedValue({ data: { login: 'user', fullname: 'User', is_admin: false, allowed_routes: '' } })
    };
  });
});
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams()]
}));

describe("Login Component", () => {
    const mockSetIsLoading = jest.fn();
    const mockOnLogin = jest.fn();

    const renderComponent = () => {
        return render(<BrowserRouter>
            <LoadingContext.Provider value={{ setIsLoading: mockSetIsLoading }}>
                <AuthContext.Provider value={{
                    onLogin: mockOnLogin,
                    isAuthenticated: jest.fn(),
                    isAuthorized: jest.fn(),
                    onLogout: jest.fn()
                }}>
                    <Login />
                </AuthContext.Provider>
            </LoadingContext.Provider>
        </BrowserRouter>)
    };

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    it("should render the login form correctly", () => {
        renderComponent();
        expect(screen.getByLabelText(/login/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /acessar/i })).toBeInTheDocument();
    });
});




