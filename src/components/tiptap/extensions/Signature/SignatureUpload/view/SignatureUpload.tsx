import { Editor, Node, NodeViewWrapper } from '@tiptap/react';
import { useCallback } from 'react';

import { SignaturePad } from './SignaturePad';
import { TablesUpdate } from '@/type/database.types';

export const SignatureUpload = ({ editor, extension }: { getPos: () => number; editor: Editor; extension: Node }) => {
	const {
		options: { profile, document, signatories }
	} = extension;

	const onUpload = useCallback(
		(url: string, id: string) => {
			if (url) {
				editor.chain().deleteNode('signatureFigure').focus().run();
				editor
					.chain()
					.setSignature({ src: url, caption: `${profile.first_name} ${profile.last_name}`, id })
					.focus()
					.run();
			}
		},
		[editor, profile.first_name, profile.last_name]
	);

	return (
		<NodeViewWrapper>
			<div className="m-0 p-0" data-drag-handle>
				<SignaturePad fullName={`${profile.first_name} ${profile.last_name}`} onUpload={onUpload} />
			</div>
		</NodeViewWrapper>
	);
};

export default SignatureUpload;
