import { Editor, NodeViewWrapper } from '@tiptap/react';
import { useCallback } from 'react';

import { SignaturePad } from './SignaturePad';

export const SignatureUpload = ({ getPos, editor }: { getPos: () => number; editor: Editor }) => {
	const onUpload = useCallback(
		(url: string) => {
			if (url) {
				editor.chain().setImageBlock({ src: url }).deleteRange({ from: getPos(), to: getPos() }).focus().run();
			}
		},
		[getPos, editor]
	);

	return (
		<NodeViewWrapper>
			<div className="m-0 p-0" data-drag-handle>
				<SignaturePad onUpload={onUpload} />
			</div>
		</NodeViewWrapper>
	);
};

export default SignatureUpload;
