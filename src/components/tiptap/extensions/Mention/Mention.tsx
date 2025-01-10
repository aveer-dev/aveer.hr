import { default as MentionExtension } from '@tiptap/extension-mention';
import { ReactNodeViewRenderer, mergeAttributes } from '@tiptap/react';
import { MentionComponent } from './components/MentionComponent';

export const CustomMention = MentionExtension.extend({
	addNodeView() {
		return ReactNodeViewRenderer(MentionComponent);
	},
	parseHTML() {
		return [
			{
				tag: 'mention-component'
			}
		];
	},
	renderHTML({ HTMLAttributes }) {
		return ['mention-component', mergeAttributes(HTMLAttributes)];
	}
});
