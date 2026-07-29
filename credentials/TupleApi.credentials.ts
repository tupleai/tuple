import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class TupleApi implements ICredentialType {
	name = 'tupleApi';

	displayName = 'Tuple API';

	icon = {
		light: 'file:../nodes/Tuple/tuple-logo.png',
		dark: 'file:../nodes/Tuple/tuple-logo.dark.png',
	} as const;

	documentationUrl = 'https://tuple.ai/docs';

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://app.tuple.ai',
			placeholder: 'https://app.tuple.ai',
			required: true,
			description: 'Tuple Cloud URL or your self-hosted Tuple URL',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Tuple agent API key, usually starting with tuple_',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			method: 'GET',
			baseURL: '={{$credentials.baseUrl}}',
			url: '/v1/models',
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};
}
