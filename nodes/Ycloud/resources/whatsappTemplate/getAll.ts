import type { INodeProperties } from 'n8n-workflow';

const showOnlyForWhatsappTemplateGetAll = {
	operation: ['getAll'],
	resource: ['whatsappTemplate'],
};

export const whatsappTemplateGetAllDescription: INodeProperties[] = [
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				...showOnlyForWhatsappTemplateGetAll,
			},
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
			output: {
				maxResults: '={{ $value }}',
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
		displayOptions: {
			show: showOnlyForWhatsappTemplateGetAll,
		},
		options: [
			{
				displayName: 'WABA ID',
				name: 'wabaId',
				type: 'string',
				default: '',
				description: 'WhatsApp Business Account ID. Required if you have more than 100 WABAs.',
				routing: {
					send: {
						type: 'query',
						property: 'filter.wabaId',
						propertyInDotNotation: false,
					},
				},
			},
			{
				displayName: 'Template Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Name of the template to filter by',
				routing: {
					send: {
						type: 'query',
						property: 'filter.name',
						propertyInDotNotation: false,
					},
				},
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'string',
				default: '',
				description:
					'Language code of the template (e.g., en_US). See <a href="https://developers.facebook.com/docs/whatsapp/api/messages/message-templates#supported-languages">Supported Languages</a> for all codes.',
				routing: {
					send: {
						type: 'query',
						property: 'filter.language',
						propertyInDotNotation: false,
					},
				},
			},
		],
	},
];
