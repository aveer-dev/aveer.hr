import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';

import MentionList from './MentionList';

export const suggestion = {
	items: ({ query }: { query: string }) => {
		return [
			{ label: 'First name', description: 'First name of who gets this contract', id: 'first_name' },
			{ label: 'Last name', description: 'Last name of who gets this contract', id: 'last_name' },
			{ label: 'Date of birth', description: 'Date of birth of who gets this contract', id: 'date_of_birth' },
			{ label: 'Job title', description: 'Job title of who gets this contract', id: 'job_title' }
		]
			.filter(item => item.label.toLowerCase().startsWith(query.toLowerCase()))
			.slice(0, 5);
	},

	render: () => {
		let component: ReactRenderer<any>;
		let popup: any;

		return {
			onStart: (props: any) => {
				component = new ReactRenderer(MentionList, {
					props,
					editor: props.editor
				});

				if (!props.clientRect) {
					return;
				}

				popup = tippy('body', {
					getReferenceClientRect: props.clientRect,
					appendTo: () => document.body,
					content: component.element,
					showOnCreate: true,
					interactive: true,
					trigger: 'manual',
					placement: 'bottom-start'
				});
			},

			onUpdate(props: any) {
				component.updateProps(props);

				if (!props.clientRect) {
					return;
				}

				popup[0].setProps({
					getReferenceClientRect: props.clientRect
				});
			},

			onKeyDown(props: any) {
				if (props.event.key === 'Escape') {
					popup[0].hide();

					return true;
				}

				return component.ref?.onKeyDown(props);
			},

			onExit() {
				popup[0].destroy();
				component.destroy();
			}
		};
	}
};
