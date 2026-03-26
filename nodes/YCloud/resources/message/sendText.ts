import type { INodeProperties } from 'n8n-workflow';

const showOnlyForSendText = {
	operation: ['sendText'],
	resource: ['message'],
};

export const messageSendTextDescription: INodeProperties[] = [
	{
		displayName: 'From',
		name: 'from',
		type: 'string',
		required: true,
		displayOptions: { show: showOnlyForSendText },
		default: '',
		placeholder: '16315551234',
		description: 'Sender phone number in E.164 format',
	},
	{
		displayName: 'To',
		name: 'to',
		type: 'string',
		required: true,
		displayOptions: { show: showOnlyForSendText },
		default: '',
		placeholder: '16315551234',
		description: 'Recipient phone number in E.164 format',
	},
	{
		displayName: 'Body',
		name: 'body',
		type: 'string',
		required: true,
		displayOptions: { show: showOnlyForSendText },
		default: '',
		typeOptions: { rows: 4 },
		description: 'Text message content',
	},
	{
		displayName: 'Preview URL',
		name: 'previewUrl',
		type: 'boolean',
		displayOptions: { show: showOnlyForSendText },
		default: false,
		description: 'Whether to show URL preview',
	},
];
