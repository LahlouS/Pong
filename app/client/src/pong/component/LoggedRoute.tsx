import { Outlet, Navigate } from 'react-router-dom';
import useAuth from '../context/useAuth';

const LoggedRoute = () => {

	const {token} = useAuth();

	return !token ? <Outlet /> : <Navigate to='/pong'/>
}

export default LoggedRoute;
