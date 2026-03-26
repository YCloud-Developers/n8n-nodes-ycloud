import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class YCloudApi implements ICredentialType {
	name = 'ycloudApi';

	displayName = 'YCloud API';

	documentationUrl =
		'https://github.com/YCloud-Developers/n8n-nodes-ycloud?tab=readme-ov-file#credentials';

	icon = 'file:YCloud.svg' as const;

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-api-key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.ycloud.com/v2',
			url: '/whatsapp/templates',
			qs: { limit: 1 },
		},
	};
}
