import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { addOrdinalSuffix, cn, Frequency, generateRecurrence, parseRecurrenceRule, Weekday, weekday, frequency as frequencyList } from '@/lib/utils';
import { getWeekOfMonth } from 'date-fns';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { DatePicker } from '../ui/date-picker';

const yearMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const daysOfMonth = Array.from({ length: 31 }, (_, i) => i + 1);

const getFrequencyReadableString = (frequency: Frequency): string => {
	if (frequency == 'DAILY') return 'day';
	if (frequency == 'WEEKLY') return 'week';
	if (frequency == 'MONTHLY') return 'month';
	if (frequency == 'YEARLY') return 'year';
	return '';
};

const getWeekDayReadableString = (frequency: Weekday): string => {
	if (frequency == 'SU') return 'Sun';
	if (frequency == 'MO') return 'Mon';
	if (frequency == 'TU') return 'Tue';
	if (frequency == 'WE') return 'Wed';
	if (frequency == 'TH') return 'Thu';
	if (frequency == 'FR') return 'Fri';
	if (frequency == 'SA') return 'Sat';
	return '';
};

export const RecurrenceDialog = ({ onClose }: { onClose: (recurrence?: string) => void }) => {
	const [frequency, setFrequency] = useState('null');
	const [interval, setInterval] = useState(1);
	const [weekdays, setWeekDays] = useState<string[] | undefined>([]);
	const [monthDay, setMonthDays] = useState<number[] | undefined>();
	const [bymonth, setByMonth] = useState<number[] | undefined>(undefined);
	const [recurenceMonthOnThe, setRecurenceMonthOnThe] = useState<{ week: number | undefined; day: string | undefined }>({ week: undefined, day: undefined });
	const [recurenceMonthType, setRecurenceMonthType] = useState('each');
	const [endRepeat, setEndRepeat] = useState('never');
	const [until, setUntil] = useState<Date | undefined>(undefined);
	const [count, setCount] = useState<number>(0);
	const [position, setPosition] = useState<number>(0);
	const [recurringString, setRecurringString] = useState('');

	useEffect(() => {
		if (endRepeat == 'after') {
			setCount(1);
			setUntil(undefined);
			return;
		}

		if (endRepeat == 'on date') {
			setCount(0);
			setUntil(new Date());
			return;
		}

		if (endRepeat == 'never') {
			setCount(0);
			setUntil(undefined);
			return;
		}
	}, [endRepeat]);

	useEffect(() => {
		if (recurenceMonthType == 'on-the') {
			setMonthDays(undefined);
			setRecurenceMonthOnThe({ week: getWeekOfMonth(new Date()), day: weekday[new Date().getDay()] });
			return;
		}

		if (recurenceMonthType == 'each') {
			setMonthDays([new Date().getDate()]);
			setRecurenceMonthOnThe({ week: undefined, day: undefined });
			setWeekDays(undefined);
			setPosition(0);
			return;
		}
	}, [recurenceMonthType]);

	useEffect(() => {
		if (recurenceMonthOnThe?.week) setPosition(recurenceMonthOnThe?.week);

		if (recurenceMonthOnThe?.day) {
			if (weekday.find(day => day == recurenceMonthOnThe?.day)) {
				setWeekDays([recurenceMonthOnThe?.day]);
				return;
			}

			if (recurenceMonthOnThe?.day == 'day') {
				setMonthDays([-1]);
				setPosition(0);
			}

			if (recurenceMonthOnThe?.day == 'weekend') {
				setWeekDays(['SA', 'SU']);
				setMonthDays(undefined);
				return;
			}

			if (recurenceMonthOnThe?.day == 'weekday') {
				setWeekDays(['MO', 'TU', 'WE', 'TH', 'FR']);
				setMonthDays(undefined);
				return;
			}
		}
	}, [recurenceMonthOnThe]);

	const onFrequencyChange = (value: Frequency) => {
		setFrequency(value);

		if (value == 'MONTHLY') {
			setMonthDays([new Date().getDate()]);
			setWeekDays(undefined);
			setRecurenceMonthType('each');
			setByMonth(undefined);
			return;
		}

		if (value == 'WEEKLY') {
			setWeekDays([weekday[new Date().getDay()]]);
			setMonthDays(undefined);
			setPosition(0);
			setByMonth(undefined);
			return;
		}

		if (value == 'DAILY') {
			setWeekDays(undefined);
			setMonthDays(undefined);
			setPosition(0);
			setByMonth(undefined);
			return;
		}

		if (value == 'YEARLY') {
			setByMonth([new Date().getMonth() + 1]);
			setRecurenceMonthOnThe({ week: getWeekOfMonth(new Date()), day: weekday[new Date().getDay()] });
			setWeekDays([weekday[new Date().getDay()]]);
			setMonthDays(undefined);
			return;
		}
	};

	const getRecurrenceString = () => {
		if (frequency == 'null') {
			setRecurringString('');
			onClose();
			return;
		}

		const recurrence = generateRecurrence({
			frequency,
			interval,
			weekdays,
			count,
			until,
			monthDay,
			position,
			bymonth
		});
		console.log('🚀 ~ getRecurrenceString ~ recurrence:', recurrence);

		setRecurringString(recurrence);
		onClose(recurrence);
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="secondary">{recurringString == '' ? 'Does not repeat' : parseRecurrenceRule(recurringString)}</Button>
			</AlertDialogTrigger>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Set Event Frequency</AlertDialogTitle>
					<AlertDialogDescription>Set how often this event will occur.</AlertDialogDescription>
				</AlertDialogHeader>

				<div className="w-full">
					<div className="flex w-full items-center gap-4">
						<Select onValueChange={onFrequencyChange} value={frequency}>
							<SelectTrigger id="frequency" className={cn('w-full duration-300')}>
								<SelectValue placeholder="Select repeat frequency" />
							</SelectTrigger>

							<SelectContent>
								<SelectItem className="uppercase" value={'null'}>
									Does not repeat
								</SelectItem>

								{frequencyList.map(freq => (
									<SelectItem key={freq} className="uppercase" value={freq}>
										{freq}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{frequency !== 'null' && (
							<>
								<div className="flex h-10 w-fit items-center gap-2 rounded-lg border bg-input-bg px-3">
									<Label className="text-sm text-primary">Every </Label>
									<Input value={interval} onChange={event => setInterval(Number(event.target.value))} inputMode="numeric" className="h-8 w-10 text-center" type="number" placeholder="" />
									<span className="w-fit whitespace-nowrap text-sm">{`${getFrequencyReadableString(frequency)}${interval > 1 ? 's' : ''}`}</span>
								</div>

								{frequency == 'WEEKLY' && <span className="w-fit whitespace-nowrap text-sm"> on:</span>}
								{frequency == 'YEARLY' && <span className="w-fit whitespace-nowrap text-sm"> in:</span>}
							</>
						)}
					</div>

					{frequency !== 'null' && (
						<>
							<div className="mt-3 flex w-full flex-wrap items-center gap-4">
								{frequency == 'WEEKLY' && (
									<ToggleGroup value={weekdays} onValueChange={setWeekDays} type="multiple" className="mt-1 w-fit rounded-lg bg-secondary/75 p-1">
										{weekday.map(day => (
											<ToggleGroupItem
												value={day}
												key={day + 'day-toggle'}
												aria-label={`Toggle ${day}`}
												className="border border-border/70 text-xs hover:text-primary hover:ring-1 hover:ring-ring data-[state=on]:bg-primary-foreground data-[state=on]:drop-shadow">
												<span>{getWeekDayReadableString(day)}</span>
											</ToggleGroupItem>
										))}
									</ToggleGroup>
								)}

								{frequency == 'MONTHLY' && (
									<RadioGroup value={recurenceMonthType} onValueChange={setRecurenceMonthType} className="mt-3 w-full space-y-4">
										<div className="flex gap-3">
											<RadioGroupItem value="each" id="r1" />

											<Label htmlFor="r1" className="space-y-2">
												<p className="-mt-0.5 ml-1 text-sm">Each</p>

												<ToggleGroup
													disabled={recurenceMonthType !== 'each'}
													onValueChange={value => setMonthDays(value.map(item => Number(item)))}
													value={monthDay?.map(item => String(item))}
													type="multiple"
													className="grid w-fit grid-cols-7 rounded-lg bg-secondary p-1">
													{daysOfMonth.map(day => (
														<ToggleGroupItem
															value={String(day)}
															key={day + 'month-day-toggle'}
															aria-label={`month day ${day}`}
															className="!h-14 w-14 text-xs hover:text-primary hover:ring-1 hover:ring-ring data-[state=on]:bg-primary-foreground data-[state=on]:drop-shadow">
															<span>{day}</span>
														</ToggleGroupItem>
													))}
												</ToggleGroup>

												{!!monthDay?.length && recurenceMonthType == 'each' && (
													<p className="ml-1 text-xs font-light text-muted-foreground">Repeat each {monthDay?.sort().map((day, index) => `${addOrdinalSuffix(Number(day))}${index !== monthDay.length - 1 ? ', ' : ''}`)} of every month</p>
												)}
											</Label>
										</div>

										<div className="flex w-full items-center gap-3 space-x-2">
											<RadioGroupItem value="on-the" id="r2" />

											<Label htmlFor="r2" className="flex w-full items-center gap-2">
												<p className="w-fit whitespace-nowrap text-sm">On the</p>

												<Select value={String(recurenceMonthOnThe.week)} disabled={recurenceMonthType !== 'on-the'} onValueChange={value => setRecurenceMonthOnThe({ ...recurenceMonthOnThe, week: Number(value) })}>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select week in month" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="1">First</SelectItem>
														<SelectItem value="2">Second</SelectItem>
														<SelectItem value="3">Third</SelectItem>
														<SelectItem value="4">Fourth</SelectItem>
														<SelectItem value="5">Fifth</SelectItem>
														<SelectSeparator />
														<SelectItem value="-2">Second to last</SelectItem>
														<SelectItem value="-1">Last</SelectItem>
													</SelectContent>
												</Select>

												<Select value={recurenceMonthOnThe.day} disabled={recurenceMonthType !== 'on-the'} onValueChange={value => setRecurenceMonthOnThe({ ...recurenceMonthOnThe, day: value })}>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select day of the week" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="SU">Sunday</SelectItem>
														<SelectItem value="MO">Monday</SelectItem>
														<SelectItem value="TU">Tuesday</SelectItem>
														<SelectItem value="WE">Wednessday</SelectItem>
														<SelectItem value="TH">Thursday</SelectItem>
														<SelectItem value="FR">Friday</SelectItem>
														<SelectItem value="SA">Saturday</SelectItem>
														<SelectSeparator />
														<SelectItem value="day">Day</SelectItem>
														<SelectItem value="weekend">Weekend</SelectItem>
														<SelectItem value="weekday">Weekday</SelectItem>
													</SelectContent>
												</Select>
											</Label>
										</div>
									</RadioGroup>
								)}

								{frequency == 'YEARLY' && (
									<>
										<ToggleGroup value={bymonth?.map(month => String(month))} onValueChange={values => setByMonth(values.map(month => Number(month)))} type="multiple" className="mt-3 grid w-fit grid-cols-6 rounded-lg bg-secondary p-1">
											{yearMonths.map((month, index) => (
												<ToggleGroupItem
													value={String(index + 1)}
													key={month + 'year-month-toggle'}
													aria-label={`year month ${month}`}
													className="h-[4.5rem] w-[4.5rem] text-xs hover:text-primary hover:ring-1 hover:ring-ring data-[state=on]:bg-primary-foreground data-[state=on]:drop-shadow">
													<span>{month}</span>
												</ToggleGroupItem>
											))}
										</ToggleGroup>

										<div className="mt-3 flex w-full items-center gap-2">
											<p className="w-fit whitespace-nowrap text-sm">On the</p>

											<Select value={String(recurenceMonthOnThe.week)} onValueChange={value => setRecurenceMonthOnThe({ ...recurenceMonthOnThe, week: Number(value) })}>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Select week in month" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="1">First</SelectItem>
													<SelectItem value="2">Second</SelectItem>
													<SelectItem value="3">Third</SelectItem>
													<SelectItem value="4">Fourth</SelectItem>
													<SelectItem value="5">Fifth</SelectItem>
													<SelectSeparator />
													<SelectItem value="-2">Second to last</SelectItem>
													<SelectItem value="-1">Last</SelectItem>
												</SelectContent>
											</Select>

											<Select value={recurenceMonthOnThe.day} onValueChange={value => setRecurenceMonthOnThe({ ...recurenceMonthOnThe, day: value })}>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Select day of the week" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="SU">Sunday</SelectItem>
													<SelectItem value="MO">Monday</SelectItem>
													<SelectItem value="TU">Tuesday</SelectItem>
													<SelectItem value="WE">Wednessday</SelectItem>
													<SelectItem value="TH">Thursday</SelectItem>
													<SelectItem value="FR">Friday</SelectItem>
													<SelectItem value="SA">Saturday</SelectItem>
													<SelectSeparator />
													<SelectItem value="day">Day</SelectItem>
													<SelectItem value="weekend">Weekend</SelectItem>
													<SelectItem value="weekday">Weekday</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</>
								)}
							</div>

							<div className="mt-3 w-full space-y-2">
								<Label className="w-fit whitespace-nowrap" htmlFor="end-repeat">
									End repeat
								</Label>

								<div className="flex gap-3">
									<Select value={endRepeat} onValueChange={setEndRepeat}>
										<SelectTrigger id="end-repeat" className="w-full capitalize">
											<SelectValue placeholder="Select frequency ending" />
										</SelectTrigger>

										<SelectContent>
											{['never', 'after', 'on date'].map(item => (
												<SelectItem className="capitalize" key={item} value={item}>
													{item}
												</SelectItem>
											))}
										</SelectContent>
									</Select>

									{endRepeat == 'after' && (
										<div className="flex h-10 w-fit items-center gap-2 rounded-lg border bg-input-bg px-3">
											<Input value={count} onChange={event => setCount(Number(event.target.value))} min={1} inputMode="numeric" className="h-8 w-10 text-center" type="number" placeholder="" />
											<span className="w-fit whitespace-nowrap text-sm">Occurence</span>
										</div>
									)}

									{endRepeat == 'on date' && until && <DatePicker selected={until} onSetDate={setUntil} />}
								</div>
							</div>
						</>
					)}
				</div>

				<AlertDialogFooter className="mt-6">
					<AlertDialogCancel className="w-full">Cloe</AlertDialogCancel>

					<AlertDialogAction className="w-full" onClick={getRecurrenceString}>
						Set frequency
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
