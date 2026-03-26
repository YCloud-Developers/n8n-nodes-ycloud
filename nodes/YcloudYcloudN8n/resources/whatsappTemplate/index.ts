import type { INodeProperties } from 'n8n-workflow';
import { whatsappTemplateGetAllDescription } from './getAll';

const showOnlyForWhatsappTemplates = {
	resource: ['whatsappTemplate'],
};

export const whatsappTemplateDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForWhatsappTemplates,
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get templates',
				description: 'Get a list of WhatsApp templates',
				routing: {
					request: {
						method: 'GET',
						url: '/whatsapp/templates',
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'items',
								},
							},
						],
					},
				},
			},
		],
		default: 'getAll',
	},
	...whatsappTemplateGetAllDescription,
];
