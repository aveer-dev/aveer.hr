import { mergeAttributes } from '@tiptap/core';
import { Figure } from '../Figure';
import { SignatureUpload } from './SignatureUpload';
import { SignatureCaption } from './Signee';
import { v4 as uuid } from 'uuid';

declare module '@tiptap/core' {
	// eslint-disable-next-line no-unused-vars
	interface Commands<ReturnType> {
		signatureFigure: {
			setSignatureSlot: () => ReturnType;
		};
	}
}

export const SignatureFigure = Figure.extend({
	name: 'signatureFigure',

	group: 'block',

	content: 'signatureUpload signatureCaption',

	isolating: true,

	addExtensions() {
		return [SignatureUpload, SignatureCaption];
	},

	renderHTML({ HTMLAttributes }) {
		return ['figure', mergeAttributes(HTMLAttributes, { 'data-type': this.name }), ['div', {}, 0]];
	},

	addKeyboardShortcuts() {
		return {
			Enter: () => false
		};
	},

	addAttributes() {
		return {
			...this.parent?.(),
			'data-id': {
				default: uuid(),
				parseHTML: (element: { getAttribute: (arg0: string) => any }) => element.getAttribute('data-id'),
				renderHTML: (attributes: { 'data-id': any }) => ({
					'data-id': attributes['data-id']
				})
			},
			'data-toc-id': {
				default: uuid(),
				parseHTML: (element: { getAttribute: (arg0: string) => any }) => element.getAttribute('data-toc-id'),
				renderHTML: (attributes: { 'data-toc-id': any }) => ({
					'data-toc-id': attributes['data-toc-id']
				})
			},
			id: {
				default: null,
				parseHTML: (element: { getAttribute: (arg0: string) => any }) => element.getAttribute('data-toc-id'),
				renderHTML: (attributes: { 'data-toc-id': any }) => ({
					id: attributes['data-toc-id']
				})
			}
		};
	},

	addCommands() {
		return {
			setSignatureSlot:
				() =>
				({ state, chain }) => {
					const position = state.selection.$from.start();
					const selectionContent = state.selection.content();

					return chain()
						.focus()
						.insertContent({
							type: this.name,
							content: [
								{ type: 'signatureUpload' },
								{
									type: 'signatureCaption',
									content: selectionContent.content.toJSON() || [
										{
											type: 'paragraph',
											attrs: {
												textAlign: 'left'
											}
										}
									]
								}
							]
						})
						.focus(position + 1)
						.run();
				}
		};
	}
});

export default SignatureFigure;
