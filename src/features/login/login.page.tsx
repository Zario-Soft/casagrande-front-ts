import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { toast } from 'react-toastify';
import LoginService, { DoLoginRequest } from './login.service';
import { AuthContext } from '../../providers/auth.provider';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import logo from '../../assets/logo.png';
import TopBar from 'src/components/top-bar/top-bar.index';
import md5 from 'md5';
import { pageRoutes } from 'src/routes';

export default function Login() {

  const loginService = new LoginService();
  const auth = React.useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('')

  useEffect(() => {
    const lastmail = localStorage.getItem('lastmail');
    if (lastmail)
      setEmail(lastmail)
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const values: DoLoginRequest = {
      usuario: String(formData.get('login')),
      senha: md5(String(formData.get('password'))),
      rawSenha: String(formData.get('password'))
    };

    if (!isValid(values)) return;

    const { data } = await loginService.doLogin(values);
    if (data) {

      const rememberme = Boolean(formData.get('remember'))
      if (rememberme)
        localStorage.setItem('lastmail', values.usuario)

      toast.success('Logado com sucesso!');
      auth.onLogin(data.token, values.usuario);

      navigate(pageRoutes.CLIENTES);
    }
  };

  const isValid = async (info: DoLoginRequest): Promise<boolean> => {
    if (!info.usuario) {
      toast.error('É necessário informar o login.');
      return false;
    }

    if (!info.senha) {
      toast.error('É necessário informar a senha.')
      return false;
    }

    //console.log(await bcrypt.hash(info.password, 10))

    return true;
  }

  return (<>
    <TopBar />
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, cursor: 'pointer' }} src={logo} />

        <Typography component="h1" variant="h5">
          Acesso
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="login"
            label="Login"
            name="login"
            autoFocus
            value={email}
            onChange={async (e: any) => await setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type="password"
            id="password"
            autoComplete="current-password"
          />
          {/* <FormControlLabel
              control={<Checkbox name="remember" value="remember" color="primary" defaultChecked />}
              label="Recordar mi correo"
            /> */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Acessar
          </Button>
        </Box>
      </Box>
    </Container>
  </>);
}