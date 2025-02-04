import { findChildrenInRange, mergeAttributes, Node, nodeInputRule, Tracker } from '@tiptap/core';

export interface SignatureImageOptions {
	HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		signatureImage: {
			/**
			 * Add a figure element
			 */
			setSignature: (options: { src: string; alt?: string; title?: string; caption: string; id: string }) => ReturnType;
		};
	}
}

export const inputRegex = /!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/;

export const SignatureImage = Node.create<SignatureImageOptions>({
	name: 'signatureImage',

	addOptions() {
		return {
			HTMLAttributes: {}
		};
	},

	group: 'block',

	content: 'inline*',

	draggable: true,

	isolating: true,

	addAttributes() {
		return {
			src: {
				default: null,
				parseHTML: element => element.querySelector('img')?.getAttribute('src')
			},

			alt: {
				default: null,
				parseHTML: element => element.querySelector('img')?.getAttribute('alt')
			},

			title: {
				default: null,
				parseHTML: element => element.querySelector('img')?.getAttribute('title')
			},

			id: {
				default: null,
				parseHTML: element => element.querySelector('img')?.getAttribute('id')
			}
		};
	},

	parseHTML() {
		return [
			{
				tag: 'figure',
				contentElement: 'figcaption'
			}
		];
	},

	renderHTML({ HTMLAttributes }) {
		return ['figure', mergeAttributes(this.options.HTMLAttributes, { id: HTMLAttributes.id }, { 'data-type': this.name }), ['img', mergeAttributes(HTMLAttributes, { draggable: false, contenteditable: false })], ['figcaption', 0]];
	},

	addCommands() {
		return {
			setSignature:
				({ caption, ...attrs }) =>
				({ chain }) => {
					return (
						chain()
							.insertContent({
								type: this.name,
								attrs,
								content: caption ? [{ type: 'text', text: caption }] : []
							})
							// set cursor at end of caption field
							.command(({ tr, commands }) => {
								const { doc, selection } = tr;
								const position = doc.resolve(selection.to - 2).end();

								return commands.setTextSelection(position);
							})
							.run()
					);
				}
		};
	},

	addInputRules() {
		return [
			nodeInputRule({
				find: inputRegex,
				type: this.type,
				getAttributes: match => {
					const [, src, alt, title] = match;

					return { src, alt, title };
				}
			})
		];
	}
});
