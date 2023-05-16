import { ThemeProvider, createTheme } from '@mui/material';
import { Redirect } from './component/Oauth2';
import MainPage from './page/MainPage';
import LeadPage from './page/LeadPage';
import AboutUs from './page/AboutUs';
import Contact from './page/Contact';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './component/Login';
import { AuthProvider } from './context/useAuth';
import SignUp from './component/SignUp';
import '../index.css';

/**
 * ============ Entrypoint of the project =============
 */

const theme = createTheme({
	typography: {
		fontFamily: 'pong-policy'
	},
	breakpoints: {
		values: {
			xs: 0,
			sm: 600,
			md: 950,
			lg: 1200,
			xl: 1536,
		},
	},
	palette: {
		primary: {
			main: '#213547'
		}
	}
})

export const Pong = () => {

	return (
		<>
			<ThemeProvider theme={theme}>
				<BrowserRouter>
					<AuthProvider>
						<Routes>
							<Route path='/' element={<MainPage />} />
							<Route path='/aboutus' element={<AboutUs />} />
							<Route path='/contact' element={<Contact />} />
							{/*  */}<Route path='/login' element={<Login />} />
							<Route path='/signup' element={<SignUp />} />
							<Route path='/pong' element={<LeadPage />} />
							<Route path="/redirect" element={<Redirect />} />
						</Routes>
					</AuthProvider>
				</BrowserRouter>
			</ThemeProvider>
		</>
	)
}
//						<Route element= { <LoggedRoute /> }>

//				<Route path='/chat' element={<Chat/>} />

