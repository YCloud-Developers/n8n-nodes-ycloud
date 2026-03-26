import type { INodeProperties } from 'n8n-workflow';

const showOnlyForSendTemplate = {
	operation: ['sendTemplate'],
	resource: ['message'],
};

export const messageSendTemplateDescription: INodeProperties[] = [
	{
		displayName: 'From',
		name: 'from',
		type: 'string',
		required: true,
		displayOptions: { show: showOnlyForSendTemplate },
		default: '',
		placeholder: '16315551234',
		description: 'Sender phone number in E.164 format',
	},
	{
		displayName: 'To',
		name: 'to',
		type: 'string',
		required: true,
		displayOptions: { show: showOnlyForSendTemplate },
		default: '',
		placeholder: '16315551234',
		description: 'Recipient phone number in E.164 format',
	},
	{
		displayName: 'WABA ID',
		name: 'wabaId',
		type: 'string',
		required: true,
		displayOptions: { show: showOnlyForSendTemplate },
		default: '',
		description: 'WhatsApp Business Account ID',
	},
	{
		displayName: 'Template Name',
		name: 'templateName',
		type: 'string',
		required: true,
		displayOptions: { show: showOnlyForSendTemplate },
		default: '',
		description: 'Name of the WhatsApp template',
	},
	{
		displayName: 'Language Code',
		name: 'languageCode',
		type: 'string',
		required: true,
		displayOptions: { show: showOnlyForSendTemplate },
		default: 'en_US',
		placeholder: 'en_US',
		description: 'Language code for the template',
	},
	{
		displayName: 'Template Variables',
		name: 'templateVariables',
		type: 'resourceMapper',
		noDataExpression: true,
		default: {
			mappingMode: 'defineBelow',
			value: null,
		},
		required: true,
		displayOptions: { show: showOnlyForSendTemplate },
		typeOptions: {
			loadOptionsDependsOn: ['templateName', 'languageCode', 'wabaId'],
			resourceMapper: {
				resourceMapperMethod: 'getTemplateVariables',
				addAllFields: true,
				supportAutoMap: false,
				mode: 'add',
				fieldWords: {
					singular: 'variable',
					plural: 'variables',
				},
			},
		},
	},
];
