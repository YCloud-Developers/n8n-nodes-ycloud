# @ycloud-ai/n8n-nodes-ycloud

This is an n8n community node. It lets you use [YCloud](https://www.ycloud.com/) in your n8n workflows.

YCloud is a cloud communication platform providing WhatsApp Business API, SMS, and other messaging services for businesses.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation) |
[Operations](#operations) |
[Credentials](#credentials) |
[Compatibility](#compatibility) |
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### WhatsApp Template
- **Get Many** - Retrieve a list of WhatsApp templates with optional filters (WABA ID, template name, language)

### Message
- **Send Text** - Send a text message
- **Send Template** - Send a template message with dynamic variable loading
- **Send Button** - Send an interactive button message (up to 3 reply buttons)
- **Send List** - Send an interactive list message with sections and rows

### Contact
- **Create** - Create a new contact
- **Get** - Retrieve a contact by ID
- **Get Many** - Retrieve a list of contacts with optional filters (tags, country code, phone number, email)

## Credentials

You need a YCloud API key to use this node.

1. Sign up at [YCloud](https://www.ycloud.com/)
2. Go to your dashboard and navigate to **Settings** > **API Keys**
3. Copy your API key
4. In n8n, create a new **YCloud API** credential and paste your API key

## Compatibility

Tested with n8n version 2.13.x. Minimum required version: 1.x.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [YCloud API documentation](https://docs.ycloud.com/reference)
* [YCloud website](https://www.ycloud.com/)
