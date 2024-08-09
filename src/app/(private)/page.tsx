import { Chart } from '@/components/dashboard/chart';
import { columns } from '@/components/dashboard/column';
import { DataTable } from '@/components/dashboard/table';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { PERSON } from '@/type/person';
import { ChevronsUpDown, Plus, PlusIcon } from 'lucide-react';
import Link from 'next/link';

export default function OrgsPage() {
	return <div className="mx-auto grid gap-20">Orgs</div>;
}
