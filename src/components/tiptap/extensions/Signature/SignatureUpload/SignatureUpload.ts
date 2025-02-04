import { Node, ReactNodeViewRenderer } from '@tiptap/react';
import { SignatureUpload as SignatureUploadComponent } from './view/SignatureUpload';

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		signatureUpload: {
			setSignatureUpload: () => ReturnType;
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

	addOptions() {
		return {
			profile: null,
			uploadPath: '',
			onSignDocuemnt: () => null,
			document: null,
			signatories: []
		};
	},

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
			setSignatureUpload:
				() =>
				({ commands }) =>
					commands.insertContent('')
		};
	},

	addNodeView() {
		return ReactNodeViewRenderer(SignatureUploadComponent);
	}
});

export default SignatureUpload;
