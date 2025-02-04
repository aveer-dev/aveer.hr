import { mergeAttributes } from '@tiptap/core';
import { Figure } from '../Figure';
import { SignatureUpload } from './SignatureUpload';
import { SignatureCaption } from './Signee';
import { Node } from '@tiptap/core';

declare module '@tiptap/core' {
	// eslint-disable-next-line no-unused-vars
	interface Commands<ReturnType> {
		signatureFigure: {
			setSignatureSlot: () => ReturnType;
		};
	}
}

export const SignatureFigure = Node.create({
	name: 'signatureFigure',

	group: 'block',

	content: 'signatureUpload',

	isolating: true,

	addExtensions() {
		return [SignatureUpload.configure({ ...this.options })];
	},

	renderHTML({ HTMLAttributes }) {
		return ['div', mergeAttributes(HTMLAttributes, { 'data-type': this.name }), ['div', {}, 0]];
	},

	addKeyboardShortcuts() {
		return {
			Enter: () => false
		};
	},

	addOptions() {
		return {
			profile: null,
			uploadPath: '',
			onSignDocuemnt: () => null,
			document: null,
			signatories: []
		};
	},

	addAttributes() {
		return {
			...this.parent?.(),
			id: {
				default: null,
				parseHTML: (element: { getAttribute: (arg0: string) => any }) => element.getAttribute('data-id'),
				renderHTML: (attributes: { 'data-id': any }) => ({
					id: attributes['data-id']
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

					return chain()
						.focus()
						.insertContent({
							type: this.name,
							content: [{ type: 'signatureUpload' }]
						})
						.focus(position + 1)
						.run();
				}
		};
	}
});

export default SignatureFigure;
