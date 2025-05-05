'use client';

interface User {
	id: string;
	name: string;
	color: string;
}

export const ActiveUsers = ({ users }: { users: User[] }) => {
	if (!users || users.length === 0) return null;
	return (
		<div className="fixed right-4 top-20 flex -space-x-2 overflow-hidden">
			{users.map(user => (
				<div key={user.id} className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100" style={{ backgroundColor: user.color }} title={user.name}>
					{user.name.charAt(0)}
				</div>
			))}
		</div>
	);
};
