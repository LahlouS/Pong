import * as React from 'react'

export type Api = {
	api: {
		input: RequestInfo | URL,
		option?: RequestInit,
		dataType?: string,
		token?: string,
	}
	auth: {
		token: string,
		setUser: React.Dispatch<React.SetStateAction<string>>,
		setId: React.Dispatch<React.SetStateAction<number>>,
		setToken: React.Dispatch<React.SetStateAction<string>>,
		setIntraLogin: React.Dispatch<React.SetStateAction<string>>,
		navigate: (route: string) => void,
	},
}

export type apiInput = {
	input: RequestInfo | URL,
	option?: RequestInit,
	dataType?: string,
	token?: string,
}

export type responseApi = {
	response: Response,
	data: any,
	token: string | null
}

export const originalRequest = async (api: apiInput) => {


	const response = await fetch(api.input, api.option);


	let data;
	let token;

	if (!api.dataType)
		data = await response.json();
	else if (api.dataType === 'text')
		data = await response.text();
	else if (api.dataType === 'null')
		data = null;

	if (api.token)
		token = api.token;
	else
		token = null;

	return {response, data, token};

}

export const refreshRequest = async () => {


	const response = await fetch(`http://${import.meta.env.VITE_SITE}/api/auth/refresh`);
	const data = await response.json();
	return { response, data };
}

/**
 * @include
 * 			import { useFetchAuth } from '/src/pong/context/useAuth'
 * 			import { FetchApi, Api } from '/src/pong/component/FetchApi'
 *
 * @Usage
 * 			const fetchType: Api = {
 * 				api: {
 * 					input: `http://${import.meta.env.VITE_SITE}/api/users/profile/auth`,
 * 					option: {
 * 						method: "GET",
 * 					},
 *  			},
 * 				auth: useFetchAuth(),
 * 			}
 *
 * 			...
 *
 * 			const {response, data} = FetchApi(fetchType)
 *
 *
 * @param
 * 			fetchType: Api
 * @returns
 * 			const {response, data, token}
 */

export const FetchApi = async (fetchType: Api) => {

	try {


		let newHeaders = {
			...fetchType.api.option?.headers,
			'Authorization': `Bearer ${fetchType.auth.token}`
		}

		let newOption = {
			...fetchType.api.option,
			headers: newHeaders,
		};

		let newApi = {
			...fetchType.api,
			option: newOption,
			token: fetchType.auth.token
		};


		const response: responseApi = await originalRequest(newApi)

		if (response.response.statusText === "Unauthorized") {

			const refresh = await refreshRequest();

			if (refresh.response.status !== 200 && refresh.response.status !== 304) {
				fetchType.auth.setToken('');
				fetchType.auth.setUser('');
				fetchType.auth.setId(0);
				fetchType.auth.setIntraLogin('');
				fetchType.auth.navigate('/login');

			} else {

				fetchType.auth.setToken(refresh.data['aT']);

				newHeaders = {
					...fetchType.api.option?.headers,
					'Authorization': `Bearer ${refresh.data['aT']}`
				}

				newOption = {
					...fetchType.api.option,
					headers: newHeaders,
				};

				newApi = {
					...fetchType.api,
					option: newOption,
					token: refresh.data['aT']
				};

				return await originalRequest(newApi)
			}
		}
		return response;

	} catch (err) {
		console.log(err);
	}
}
