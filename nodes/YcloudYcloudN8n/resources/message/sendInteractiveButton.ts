import type { INodeProperties } from 'n8n-workflow';

const showOnlyForSendInteractiveButton = {
	operation: ['sendInteractiveButton'],
	resource: ['message'],
};

export const messageSendInteractiveButtonDescription: INodeProperties[] = [
	{
		displayName: 'From',
		name: 'from',
		type: 'string',
		required: true,
		displayOptions: { show: showOnlyForSendInteractiveButton },
		default: '',
		placeholder: '16315551234',
		description: 'Sender phone number in E.164 format',
	},
	{
		displayName: 'To',
		name: 'to',
		type: 'string',
		required: true,
		displayOptions: { show: showOnlyForSendInteractiveButton },
		default: '',
		placeholder: '16315551234',
		description: 'Recipient phone number in E.164 format',
	},
	{
		displayName: 'Body Text',
		name: 'bodyText',
		type: 'string',
		required: true,
		displayOptions: { show: showOnlyForSendInteractiveButton },
		default: '',
		typeOptions: { rows: 4 },
		description: 'Message body text',
	},
	{
		displayName: 'Buttons',
		name: 'buttons',
		type: 'fixedCollection',
		required: true,
		displayOptions: { show: showOnlyForSendInteractiveButton },
		typeOptions: {
			multipleValues: true,
			maxValue: 3,
		},
		default: {},
		placeholder: 'Add Button',
		options: [
			{
				displayName: 'Button',
				name: 'buttonValues',
				values: [
					{
						displayName: 'Title',
						name: 'title',
						type: 'string',
						required: true,
						default: '',
						placeholder: 'Button 1',
						description: 'Button title. Max 20 characters.',
					},
					{
						displayName: 'ID',
						name: 'id',
						type: 'string',
						required: true,
						default: '',
						placeholder: 'btn_1',
						description: 'Unique button identifier. Returned in webhook on click. Max 256 characters.',
					},
				],
			},
		],
		description: 'Reply buttons. Up to 3 buttons.',
	},
	{
		displayName: 'Header',
		name: 'header',
		type: 'string',
		displayOptions: { show: showOnlyForSendInteractiveButton },
		default: '',
		description: 'Optional header text',
	},
	{
		displayName: 'Footer',
		name: 'footer',
		type: 'string',
		displayOptions: { show: showOnlyForSendInteractiveButton },
		default: '',
		description: 'Optional footer text',
	},
];
