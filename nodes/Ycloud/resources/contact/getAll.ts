import type { INodeProperties } from 'n8n-workflow';

const showOnlyForContactGetAll = {
	operation: ['getAll'],
	resource: ['contact'],
};

export const contactGetAllDescription: INodeProperties[] = [
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: showOnlyForContactGetAll,
		},
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 50,
		routing: {
			send: {
				type: 'query',
				property: 'limit',
			},
		},
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: showOnlyForContactGetAll },
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
						type: 'query',
						property: 'filter.countryCode',
					},
				},
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				placeholder: 'support@example.com',
				description: "Contact's email address",
				routing: {
					send: {
						type: 'query',
						property: 'filter.email',
					},
				},
			},
			{
				displayName: 'Phone Number',
				name: 'phoneNumber',
				type: 'string',
				default: '',
				placeholder: '+16315551111',
				description: 'Phone number in E.164 format',
				routing: {
					send: {
						type: 'query',
						property: 'filter.phoneNumber',
					},
				},
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				placeholder: 'tag1,tag2',
				description: 'Comma-separated list of tags to filter by',
				routing: {
					send: {
						type: 'query',
						property: 'filter.tags',
					},
				},
			},
		],
	},
];
