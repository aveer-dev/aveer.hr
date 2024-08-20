import Link, { LinkProps } from 'next/link';
import { AnchorHTMLAttributes, ReactNode } from 'react';

interface props {
	children: ReactNode;
	org?: string;
}

export const NavLink = ({
	children,
	...props
}: props &
	Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> &
	LinkProps & {
		children?: React.ReactNode;
	} & React.RefAttributes<HTMLAnchorElement>) => {
	let path = process.env.NEXT_PUBLIC_ENABLE_SUBDOOMAIN !== 'true' && props.org ? `/${props.org}${props.href}` : `${props.href}`;

	return (
		<Link {...props} href={path}>
			{children}
		</Link>
	);
};
