import type { INodeProperties } from 'n8n-workflow';
import { messageSendInteractiveButtonDescription } from './sendInteractiveButton';
import { messageSendInteractiveListDescription } from './sendInteractiveList';
import { messageSendTemplateDescription } from './sendTemplate';
import { messageSendTextDescription } from './sendText';

const showOnlyForMessage = {
	resource: ['message'],
};

export const messageDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForMessage,
		},
		options: [
			{
				name: 'Send Button',
				value: 'sendInteractiveButton',
				action: 'Send button message',
				description: 'Send an interactive button message',
				routing: {
					request: {
						method: 'POST',
						url: '/whatsapp/messages/sendDirectly',
						body: {
							from: '={{$parameter.from}}',
							to: '={{$parameter.to}}',
							type: 'interactive',
							interactive: {
								type: 'button',
								body: {
									text: '={{$parameter.bodyText}}',
								},
							},
						},
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const header = this.getNodeParameter('header', '') as string;
								const footer = this.getNodeParameter('footer', '') as string;
								const buttonsData = this.getNodeParameter('buttons', {}) as {
									buttonValues?: Array<{ title: string; id: string }>;
								};

								const body = requestOptions.body as Record<string, unknown>;
								const interactive = body.interactive as Record<string, unknown>;

								if (header) {
									interactive.header = { type: 'text', text: header };
								}
								if (footer) {
									interactive.footer = { text: footer };
								}

								const buttonItems = buttonsData.buttonValues || [];
								const buttons = buttonItems.map((btn) => ({
									type: 'reply',
									reply: { id: btn.id, title: btn.title },
								}));
								const action = interactive.action as Record<string, unknown> || {};
								action.buttons = buttons;
								interactive.action = action;

								return requestOptions;
							},
						],
					},
				},
			},
			{
				name: 'Send List',
				value: 'sendInteractiveList',
				action: 'Send list message',
				description: 'Send an interactive list message',
				routing: {
					request: {
						method: 'POST',
						url: '/whatsapp/messages/sendDirectly',
						body: {
							from: '={{$parameter.from}}',
							to: '={{$parameter.to}}',
							type: 'interactive',
							interactive: {
								type: 'list',
								body: {
									text: '={{$parameter.bodyText}}',
								},
							},
						},
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const header = this.getNodeParameter('header', '') as string;
								const footer = this.getNodeParameter('footer', '') as string;
								const buttonText = this.getNodeParameter('buttonText', '') as string;
								const sectionsData = this.getNodeParameter('sections', {}) as {
									sectionValues?: Array<{
										title: string;
										rows: {
											rowValues?: Array<{
												title: string;
												id: string;
												description?: string;
											}>;
										};
									}>;
								};

								const body = requestOptions.body as Record<string, unknown>;
								const interactive = body.interactive as Record<string, unknown>;

								if (header) {
									interactive.header = { type: 'text', text: header };
								}
								if (footer) {
									interactive.footer = { text: footer };
								}

								const sectionItems = sectionsData.sectionValues || [];
								const sections = sectionItems.map((section) => {
									const rowItems = section.rows?.rowValues || [];
									const rows = rowItems.map((row) => {
										const r: Record<string, string> = {
											id: row.id,
											title: row.title,
										};
										if (row.description) {
											r.description = row.description;
										}
										return r;
									});
									const s: Record<string, unknown> = { rows };
									if (section.title) {
										s.title = section.title;
									}
									return s;
								});

								interactive.action = {
									button: buttonText,
									sections,
								};

								return requestOptions;
							},
						],
					},
				},
			},
			{
				name: 'Send Template',
				value: 'sendTemplate',
				action: 'Send template message',
				description: 'Send a WhatsApp template message',
				routing: {
					request: {
						method: 'POST',
						url: '/whatsapp/messages/sendDirectly',
						body: {
							from: '={{$parameter.from}}',
							to: '={{$parameter.to}}',
							type: 'template',
							template: {
								name: '={{$parameter.templateName}}',
								language: {
									code: '={{$parameter.languageCode}}',
								},
							},
						},
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const templateVars = this.getNodeParameter('templateVariables', {}) as {
									mappingMode: string;
									value: Record<string, string> | null;
								};
								const values = templateVars?.value || {};
								const body = requestOptions.body as Record<string, unknown>;
								const template = body.template as Record<string, unknown>;

								// Collect parameters for each component
								const headerParams: Array<{ type: string; [key: string]: unknown }> = [];
								const bodyParams: Array<{ type: string; text: string }> = [];
								const buttonParams: Array<{
									type: string;
									sub_type: string;
									index: number;
									parameters: Array<{ type: string; text: string }>;
								}> = [];

								// Collect parameters for each carousel card
								const carouselCards: Map<
									number,
									{
										headerParams: Array<{ type: string; [key: string]: unknown }>;
										bodyParams: Array<{ type: string; text: string }>;
										buttonParams: Array<{
											type: string;
											sub_type: string;
											index: number;
											parameters: Array<{ type: string; text: string }>;
										}>;
									}
								> = new Map();

								for (const [key, val] of Object.entries(values)) {
									if (!val || key === '_no_variables') continue;

									if (key.startsWith('carousel_')) {
										// carousel_0_header_media_video / carousel_0_body_1 / carousel_0_button_0_url
										const rest = key.replace('carousel_', '');
										const cardIdx = parseInt(rest.split('_')[0], 10);
										if (!carouselCards.has(cardIdx)) {
											carouselCards.set(cardIdx, {
												headerParams: [],
												bodyParams: [],
												buttonParams: [],
											});
										}
										const card = carouselCards.get(cardIdx)!;
										const cardKey = rest.replace(`${cardIdx}_`, '');

										if (cardKey.startsWith('header_media_')) {
											const mediaType = cardKey.replace('header_media_', '');
											card.headerParams.push({
												type: mediaType,
												[mediaType]: { link: val },
											});
										} else if (cardKey.startsWith('body_')) {
											card.bodyParams.push({ type: 'text', text: val });
										} else if (cardKey.startsWith('button_')) {
											const btnParts = cardKey.split('_');
											const btnIdx = parseInt(btnParts[1], 10);
											card.buttonParams.push({
												type: 'button',
												sub_type: 'url',
												index: btnIdx,
												parameters: [{ type: 'text', text: val }],
											});
										}
									} else if (key.startsWith('header_media_')) {
										const mediaType = key.replace('header_media_', '');
										headerParams.push({ type: mediaType, [mediaType]: { link: val } });
									} else if (key.startsWith('header_')) {
										headerParams.push({ type: 'text', text: val });
									} else if (key.startsWith('body_')) {
										bodyParams.push({ type: 'text', text: val });
									} else if (key.startsWith('button_')) {
										const parts = key.split('_');
										const btnIdx = parseInt(parts[1], 10);
										buttonParams.push({
											type: 'button',
											sub_type: 'url',
											index: btnIdx,
											parameters: [{ type: 'text', text: val }],
										});
									}
								}

								const components: Array<Record<string, unknown>> = [];
								if (headerParams.length > 0) {
									components.push({
										type: 'header',
										parameters: headerParams,
									});
								}
								if (bodyParams.length > 0) {
									components.push({
										type: 'body',
										parameters: bodyParams,
									});
								}
								for (const btn of buttonParams) {
									components.push(btn);
								}

								// Build CAROUSEL components
								if (carouselCards.size > 0) {
									const cards: Array<Record<string, unknown>> = [];
									const sortedIdxs = [...carouselCards.keys()].sort((a, b) => a - b);
									for (const idx of sortedIdxs) {
										const card = carouselCards.get(idx)!;
										const cardComponents: Array<Record<string, unknown>> = [];
										if (card.headerParams.length > 0) {
											cardComponents.push({
												type: 'header',
												parameters: card.headerParams,
											});
										}
										if (card.bodyParams.length > 0) {
											cardComponents.push({
												type: 'body',
												parameters: card.bodyParams,
											});
										}
										for (const btn of card.buttonParams) {
											cardComponents.push(btn);
										}
										cards.push({ card_index: idx, components: cardComponents });
									}
									components.push({ type: 'carousel', cards });
								}

								if (components.length > 0) {
									template.components = components;
								}

								return requestOptions;
							},
						],
					},
				},
			},
			{
				name: 'Send Text',
				value: 'sendText',
				action: 'Send text message',
				description: 'Send a text message',
				routing: {
					request: {
						method: 'POST',
						url: '/whatsapp/messages/sendDirectly',
						body: {
							from: '={{$parameter.from}}',
							to: '={{$parameter.to}}',
							type: 'text',
							text: {
								body: '={{$parameter.body}}',
								preview_url: '={{$parameter.previewUrl}}',
							},
						},
					},
				},
			},
		],
		default: 'sendText',
	},
	...messageSendInteractiveButtonDescription,
	...messageSendInteractiveListDescription,
	...messageSendTemplateDescription,
	...messageSendTextDescription,
];
