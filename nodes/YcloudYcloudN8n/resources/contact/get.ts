import type { INodeProperties } from 'n8n-workflow';

const showOnlyForContactGet = {
	operation: ['get'],
	resource: ['contact'],
};

export const contactGetDescription: INodeProperties[] = [
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		required: true,
		displayOptions: { show: showOnlyForContactGet },
		default: '',
		description: 'ID of the contact to retrieve',
	},
];
