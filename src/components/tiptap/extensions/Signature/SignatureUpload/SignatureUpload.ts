import { Node, ReactNodeViewRenderer } from '@tiptap/react';
import { SignatureUpload as SignatureUploadComponent } from './view/SignatureUpload';

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		imageUpload: {
			setImageUpload: () => ReturnType;
		};
	}
}

export const SignatureUpload = Node.create({
	name: 'signatureUpload',

	isolating: true,

	defining: true,

	group: 'block',

	draggable: true,

	selectable: true,

	inline: false,

	parseHTML() {
		return [
			{
				tag: `div[data-type="${this.name}"]`
			}
		];
	},

	renderHTML() {
		return ['div', { 'data-type': this.name }];
	},

	addCommands() {
		return {
			setImageUpload:
				() =>
				({ commands }) =>
					commands.insertContent(`<div data-type="${this.name}"></div>`)
		};
	},

	addNodeView() {
		return ReactNodeViewRenderer(SignatureUploadComponent);
	}
});

export default SignatureUpload;
