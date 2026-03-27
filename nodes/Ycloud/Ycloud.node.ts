import {
	NodeConnectionTypes,
	type ILoadOptionsFunctions,
	type INodeType,
	type INodeTypeDescription,
	type ResourceMapperFields,
} from 'n8n-workflow';
import { contactDescription } from './resources/contact';
import { messageDescription } from './resources/message';
import { whatsappTemplateDescription } from './resources/whatsappTemplate';

interface TemplateComponent {
	type: string;
	format?: string;
	text?: string;
	example?: {
		header_text?: string[];
		body_text?: string[][];
		header_handle?: string[];
	};
	buttons?: Array<{
		type: string;
		text?: string;
		url?: string;
		example?: string[];
	}>;
	cards?: Array<{
		components: TemplateComponent[];
	}>;
}

export class Ycloud implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'YCloud WhatsApp',
		name: 'ycloud',
		icon: 'file:YCloud.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the YCloud API',
		defaults: {
			name: 'YCloud WhatsApp',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'ycloudApi', required: true }],
		requestDefaults: {
			baseURL: 'https://api.ycloud.com/v2',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Contact',
						value: 'contact',
					},
					{
						name: 'Message',
						value: 'message',
					},
					{
						name: 'WhatsApp Template',
						value: 'whatsappTemplate',
					},
				],
				default: 'whatsappTemplate',
			},
			...contactDescription,
			...messageDescription,
			...whatsappTemplateDescription,
		],
	};

	methods = {
		resourceMapping: {
			async getTemplateVariables(
				this: ILoadOptionsFunctions,
			): Promise<ResourceMapperFields> {
				const wabaId = this.getNodeParameter('wabaId', '') as string;
				const templateName = this.getNodeParameter('templateName', '') as string;
				const languageCode = this.getNodeParameter('languageCode', '') as string;

				if (!wabaId || !templateName || !languageCode) {
					return { fields: [] };
				}

				try {
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'ycloudApi',
						{
							method: 'GET',
							url: `/whatsapp/templates/${wabaId}/${templateName}/${languageCode}`,
							baseURL: 'https://api.ycloud.com/v2',
							json: true,
						},
					);

					const template = response as Record<string, unknown>;
					const components = (template.components || []) as TemplateComponent[];
					const fields: ResourceMapperFields['fields'] = [];

					for (const component of components) {
						const compType = component.type;

						if (compType === 'HEADER') {
							if (component.format === 'TEXT' && component.example?.header_text) {
								const varCount = component.example.header_text.length;
								for (let i = 1; i <= varCount; i++) {
									fields.push({
										id: `header_${i}`,
										displayName: `Header Variable {{${i}}}`,
										required: true,
										defaultMatch: false,
										canBeUsedToMatch: false,
										display: true,
										type: 'string',
									});
								}
							} else if (
								component.format &&
								['IMAGE', 'VIDEO', 'DOCUMENT'].includes(component.format)
							) {
								const mediaType = component.format.toLowerCase();
								fields.push({
									id: `header_media_${mediaType}`,
									displayName: `Header Media URL (${component.format})`,
									required: true,
									defaultMatch: false,
									canBeUsedToMatch: false,
									display: true,
									type: 'string',
								});
							}
						}

						if (compType === 'BODY' && component.example?.body_text) {
							const bodyVars = component.example.body_text[0] || [];
							for (let i = 1; i <= bodyVars.length; i++) {
								fields.push({
									id: `body_${i}`,
									displayName: `Body Variable {{${i}}}`,
									required: true,
									defaultMatch: false,
									canBeUsedToMatch: false,
									display: true,
									type: 'string',
								});
							}
						}

						if (compType === 'BUTTONS' && component.buttons) {
							component.buttons.forEach((button, idx) => {
								if (button.type === 'URL' && button.url?.includes('{{')) {
									fields.push({
										id: `button_${idx}_url`,
										displayName: `Button "${button.text}" URL Variable`,
										required: true,
										defaultMatch: false,
										canBeUsedToMatch: false,
										display: true,
										type: 'string',
									});
								}
							});
						}

						if (compType === 'CAROUSEL' && component.cards) {
							component.cards.forEach((card, cardIdx) => {
								for (const cardComp of card.components) {
									if (
										cardComp.type === 'HEADER' &&
										cardComp.format &&
										['IMAGE', 'VIDEO', 'DOCUMENT'].includes(cardComp.format)
									) {
										const mediaType = cardComp.format.toLowerCase();
										fields.push({
											id: `carousel_${cardIdx}_header_media_${mediaType}`,
											displayName: `Card ${cardIdx + 1} - Header Media URL (${cardComp.format})`,
											required: true,
											defaultMatch: false,
											canBeUsedToMatch: false,
											display: true,
											type: 'string',
										});
									}
									if (cardComp.type === 'BODY' && cardComp.example?.body_text) {
										const bodyVars = cardComp.example.body_text[0] || [];
										for (let i = 1; i <= bodyVars.length; i++) {
											fields.push({
												id: `carousel_${cardIdx}_body_${i}`,
												displayName: `Card ${cardIdx + 1} - Body Variable {{${i}}}`,
												required: true,
												defaultMatch: false,
												canBeUsedToMatch: false,
												display: true,
												type: 'string',
											});
										}
									}
									if (cardComp.type === 'BUTTONS' && cardComp.buttons) {
										cardComp.buttons.forEach((button, btnIdx) => {
											if (button.type === 'URL' && button.url?.includes('{{')) {
												fields.push({
													id: `carousel_${cardIdx}_button_${btnIdx}_url`,
													displayName: `Card ${cardIdx + 1} - Button "${button.text}" URL Variable`,
													required: true,
													defaultMatch: false,
													canBeUsedToMatch: false,
													display: true,
													type: 'string',
												});
											}
										});
									}
								}
							});
						}
					}

					if (fields.length === 0) {
						fields.push({
							id: '_no_variables',
							displayName: 'This template has no variables',
							required: false,
							defaultMatch: false,
							canBeUsedToMatch: false,
							display: true,
							type: 'string',
						});
					}

					return { fields };
				} catch {
					return { fields: [] };
				}
			},
		},
	};
}
