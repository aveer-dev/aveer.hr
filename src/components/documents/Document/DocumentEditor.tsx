'use client';

import { useRef } from 'react';
import { EditorContent } from '@tiptap/react';
import { Editor } from '@tiptap/core';
import { ContentItemMenu, LinkMenu, TextMenuBubble } from '@/components/tiptap/components/menus';
import { ColumnsMenu } from '@/components/tiptap/extensions/MultiColumn/menus';
import { TableRowMenu, TableColumnMenu } from '@/components/tiptap/extensions/Table/menus';
import ImageBlockMenu from '@/components/tiptap/extensions/ImageBlock/components/ImageBlockMenu';
import { DOCUMENT_ACCESS_TYPE } from '../types';

// Props: editor, doc, userPermittedAction, menuContainerRef
const DocumentEditor = ({ editor, doc, userPermittedAction }: { editor: Editor; doc: any; userPermittedAction: () => DOCUMENT_ACCESS_TYPE }) => {
	const menuContainerRef = useRef(null);
	return (
		<div ref={menuContainerRef}>
			<EditorContent editor={editor} className="flex-1 overflow-y-auto" />
			<ContentItemMenu editor={editor} disabled={doc.locked || doc.signed_lock || !userPermittedAction() || userPermittedAction() === 'viewer'} />
			<LinkMenu editor={editor} appendTo={menuContainerRef} />
			<TextMenuBubble editor={editor} />
			<ColumnsMenu editor={editor} appendTo={menuContainerRef} />
			<TableRowMenu editor={editor} appendTo={menuContainerRef} />
			<TableColumnMenu editor={editor} appendTo={menuContainerRef} />
			<ImageBlockMenu editor={editor} appendTo={menuContainerRef} />
		</div>
	);
};

export default DocumentEditor;
