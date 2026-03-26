import type { INodeProperties } from 'n8n-workflow';

const showOnlyForContactCreate = {
	operation: ['create'],
	resource: ['contact'],
};

export const contactCreateDescription: INodeProperties[] = [
	{
		displayName: 'Phone Number',
		name: 'phoneNumber',
		type: 'string',
		required: true,
		displayOptions: { show: showOnlyForContactCreate },
		default: '',
		placeholder: '+16315551111',
		description: 'Phone number in E.164 format',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: showOnlyForContactCreate },
		options: [
			{
				displayName: 'Country Code',
				name: 'countryCode',
				type: 'string',
				default: '',
				placeholder: 'US',
				description: 'Two-letter country abbreviation (ISO 3166-1 alpha-2)',
				routing: {
					send: {
						type: 'body',
						property: 'countryCode',
					},
				},
			},
			{
				displayName: 'Custom Attributes',
				name: 'customAttributes',
				type: 'json',
				default: '',
				description: 'Custom attributes as JSON array, e.g. [{"name":"attr1","value":"val1"}]',
				routing: {
					send: {
						type: 'body',
						property: 'customAttributes',
					},
				},
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				placeholder: 'support@example.com',
				description: 'Contact email address. Must be unique.',
				routing: {
					send: {
						type: 'body',
						property: 'email',
					},
				},
			},
			{
				displayName: 'Nickname',
				name: 'nickname',
				type: 'string',
				default: '',
				description: 'Contact nickname. Max 250 characters.',
				routing: {
					send: {
						type: 'body',
						property: 'nickname',
					},
				},
			},
			{
				displayName: 'Owner Email',
				name: 'ownerEmail',
				type: 'string',
				default: '',
				placeholder: 'support@example.com',
				description: "Email address of the contact's owner",
				routing: {
					send: {
						type: 'body',
						property: 'ownerEmail',
					},
				},
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				placeholder: 'tag1,tag2',
				description: 'Comma-separated list of tags. Max 50 tags.',
				routing: {
					send: {
						type: 'body',
						property: 'tags',
						preSend: [
							async function (this, requestOptions) {
								const body = requestOptions.body as Record<string, unknown>;
								if (typeof body.tags === 'string' && body.tags) {
									body.tags = (body.tags as string).split(',').map((t) => t.trim());
								}
								return requestOptions;
							},
						],
					},
				},
			},
		],
	},
];
