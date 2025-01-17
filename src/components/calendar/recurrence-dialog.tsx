import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { add, getWeekOfMonth } from 'date-fns';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { DatePicker } from '../ui/date-picker';
import { RRule, ALL_WEEKDAYS, WeekdayStr, Options } from 'rrule';
import { addOrdinalSuffix, cn, parseRecurrence, parseRecurrenceRule } from '@/lib/utils';

const yearMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const Frequencies: { label: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly'; freq: number; small: 'day' | 'week' | 'month' | 'year' }[] = [
	{ label: 'Daily', small: 'day', freq: 3 },
	{ label: 'Weekly', small: 'week', freq: 2 },
	{ label: 'Monthly', small: 'month', freq: 1 },
	{ label: 'Yearly', small: 'year', freq: 0 }
];

const daysOfMonth = Array.from({ length: 31 }, (_, i) => i + 1);

const getWeekDayReadableString = (weekDayString: WeekdayStr): string => {
	if (weekDayString == 'SU') return 'Sun';
	if (weekDayString == 'MO') return 'Mon';
	if (weekDayString == 'TU') return 'Tue';
	if (weekDayString == 'WE') return 'Wed';
	if (weekDayString == 'TH') return 'Thu';
	if (weekDayString == 'FR') return 'Fri';
	if (weekDayString == 'SA') return 'Sat';
	return '';
};

export const RecurrenceDialog = ({ onClose, recurrenceString }: { recurrenceString?: string; onClose: (recurrence?: string) => void }) => {
	const [frequency, setFrequency] = useState<(typeof Frequencies)[0]>(Frequencies[0]);
	const [interval, setInterval] = useState(1);
	const [weekdays, setWeekDays] = useState<WeekdayStr[] | undefined>([]);
	const [selectWeekDay, setSelectWeekDay] = useState<string>('');
	const [monthDay, setMonthDays] = useState<number[] | undefined>();
	const [bymonth, setByMonth] = useState<number[] | undefined>(undefined);
	const [monthType, setMonthType] = useState('each');
	const [endRepeat, setEndRepeat] = useState('never');
	const [until, setUntil] = useState<Date | undefined>(undefined);
	const [count, setCount] = useState<number>(0);
	const [position, setPosition] = useState<number>(1);
	const [recurringString, setRecurringString] = useState(recurrenceString);

	const getRecurrenceString = () => {
		if (!frequency) return;

		const rules: Partial<Options> = {
			freq: frequency.freq,
			interval
		};

		// set end repeat rules
		if (endRepeat == 'after') rules.count = count;
		if (endRepeat == 'on date') rules.until = until;

		// if weekly repeat
		if (frequency.label == 'Weekly') rules.byweekday = weekdays?.map(day => RRule[day]);

		// if monthly repeat
		if (frequency.label == 'Monthly') {
			if (monthType == 'each') rules.bymonthday = monthDay;
			if (monthType == 'on-the') {
				if (weekdays && weekdays.length) rules.byweekday = weekdays?.map(day => RRule[day].nth(position));
				if (monthDay && monthDay.length) rules.bymonthday = monthDay;
			}
		}

		// if yearly repeat
		if (frequency.label == 'Yearly') {
			rules.bymonth = bymonth;
			if (weekdays && weekdays.length) rules.byweekday = weekdays.map(day => RRule[day].nth(position));
			if (!weekdays?.length) rules.bymonthday = position;
		}

		const rule = new RRule(rules);
		setRecurringString(rule.toString());
		onClose(rule.toString());
		console.log(rule.toString());
	};

	const loadRecurrenceString = () => {
		if (!recurrenceString) return;

		const data = parseRecurrence(recurrenceString);
		if (data.frequency) setFrequency(Frequencies[Frequencies.findIndex(item => item.freq == RRule[data.frequency])]);
		if (data.count) {
			setCount(data.count);
			setEndRepeat('after');
		}
		if (data.bymonth) setByMonth(typeof data.bymonth == 'number' ? [data.bymonth] : data.bymonth);
		if (data.position) setPosition(data.position);
		if (data.interval) setInterval(data.interval);
		if (data.monthDay) setMonthDays(typeof data.monthDay == 'number' ? [data.monthDay] : data.monthDay);
		if (data.until) {
			setUntil(until);
			setEndRepeat('on date');
		}
		if (data.weekdays) {
			setWeekDays(data.weekdays);
			setSelectWeekDay(data.weekdays[0]);
		}

		if (data.frequency == 'MONTHLY' && data.position) setMonthType('on-the');
	};

	const onChangeFrequency = (frequency: (typeof Frequencies)[0]) => {
		setFrequency(frequency);

		if (frequency.label == 'Daily') {
			setWeekDays(undefined);
			setSelectWeekDay('');
			setMonthDays(undefined);
			setByMonth(undefined);
			setPosition(0);

			return;
		}

		if (frequency.label == 'Weekly') {
			setWeekDays([ALL_WEEKDAYS[new Date().getDay() - 1]]);
			setSelectWeekDay('');
			setMonthDays(undefined);
			setByMonth(undefined);
			setPosition(0);

			return;
		}

		if (frequency.label == 'Monthly') return setMonthType('each');

		if (frequency.label == 'Yearly') {
			setWeekDays([ALL_WEEKDAYS[new Date().getDay()]]);
			setSelectWeekDay(ALL_WEEKDAYS[new Date().getDay()]);
			setMonthDays(undefined);
			setByMonth([new Date().getMonth() + 1]);
			setPosition(getWeekOfMonth(new Date()));

			return;
		}
	};

	const onMonthTypeChange = (value: string) => {
		setMonthType(value);

		if (value == 'each') {
			setWeekDays(undefined);
			setMonthDays([new Date().getDate()]);
			setByMonth(undefined);
			setPosition(0);
		}
		if (value == 'on-the') {
			setWeekDays([ALL_WEEKDAYS[new Date().getDay() - 1]]);
			setSelectWeekDay(ALL_WEEKDAYS[new Date().getDay() - 1]);
			setMonthDays(undefined);
			setByMonth(undefined);
			setPosition(getWeekOfMonth(new Date()));
		}
	};

	return (
		<AlertDialog onOpenChange={state => state == true && loadRecurrenceString()}>
			<AlertDialogTrigger asChild>
				<Button variant="secondary">{!recurringString || recurringString == '' ? 'Does not repeat' : parseRecurrenceRule(recurringString)}</Button>
			</AlertDialogTrigger>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Set Event Frequency</AlertDialogTitle>
					<AlertDialogDescription>Set how often this event will occur.</AlertDialogDescription>
				</AlertDialogHeader>

				<div className="w-full">
					<div className="flex w-full items-center gap-4">
						<Select onValueChange={value => onChangeFrequency(Frequencies[Frequencies.findIndex(item => item.freq == Number(value))])} value={String(frequency.freq)}>
							<SelectTrigger id="frequency" className={cn('w-full duration-300')}>
								<SelectValue placeholder="Select repeat frequency" />
							</SelectTrigger>

							<SelectContent>
								{Frequencies.map(freq => (
									<SelectItem key={freq.freq} value={String(freq.freq)}>
										{freq.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{!!frequency && (
							<>
								<div className="flex h-10 w-fit items-center gap-2 rounded-lg border bg-input-bg px-3">
									<Label className="text-sm text-primary">Every </Label>
									<Input
										value={interval}
										min={1}
										max={99}
										onChange={event => (Number(event.target.value) <= 1 ? setInterval(1) : Number(event.target.value) <= 1 ? setInterval(1) : setInterval(Number(event.target.value)))}
										inputMode="numeric"
										className="h-8 w-10 text-center"
										type="number"
										placeholder=""
									/>
									<span className="w-fit whitespace-nowrap text-sm">{`${frequency.small}${interval > 1 ? 's' : ''}`}</span>
								</div>

								{frequency.label == 'Weekly' && <span className="w-fit whitespace-nowrap text-sm"> on:</span>}
								{frequency.label == 'Yearly' && <span className="w-fit whitespace-nowrap text-sm"> in:</span>}
							</>
						)}
					</div>

					{!!frequency && (
						<>
							<div className="mt-3 flex w-full flex-wrap items-center gap-4">
								{frequency.label == 'Weekly' && (
									<ToggleGroup value={weekdays} onValueChange={value => value.length >= 1 && setWeekDays(value as any)} type="multiple" className="mt-1 w-fit rounded-lg bg-secondary/75 p-1">
										{ALL_WEEKDAYS.map(day => (
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

								{frequency.label == 'Monthly' && (
									<RadioGroup value={monthType} onValueChange={onMonthTypeChange} className="mt-3 w-full space-y-4">
										<div className="flex gap-3">
											<RadioGroupItem value="each" id="r1" />

											<Label htmlFor="r1" className="space-y-2">
												<p className="-mt-0.5 ml-1 text-sm">Each</p>

												<ToggleGroup
													disabled={monthType !== 'each'}
													onValueChange={value => value.length >= 1 && setMonthDays(value.map(item => Number(item)))}
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

												{!!monthDay?.length && monthType == 'each' && (
													<p className="ml-1 text-xs font-light text-muted-foreground">Repeat each {monthDay?.sort().map((day, index) => `${addOrdinalSuffix(Number(day))}${index !== monthDay.length - 1 ? ', ' : ''}`)} of every month</p>
												)}
											</Label>
										</div>

										<div className="flex w-full items-center gap-3 space-x-2">
											<RadioGroupItem value="on-the" id="r2" />

											<Label htmlFor="r2" className="flex w-full items-center gap-2 text-primary">
												<p className="w-fit whitespace-nowrap text-sm">On the</p>

												<Select value={String(position)} disabled={monthType !== 'on-the'} onValueChange={value => setPosition(Number(value))}>
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

												<Select
													value={selectWeekDay}
													disabled={monthType !== 'on-the'}
													onValueChange={value => {
														setSelectWeekDay(value);

														if (value == 'day') {
															setWeekDays([]);
															setMonthDays([position]);
															return;
														}

														setMonthDays([]);
														setWeekDays(value.split(',') as any[]);
													}}>
													<SelectTrigger className="w-full">
														<SelectValue placeholder="Select day of the week" />
													</SelectTrigger>

													<SelectContent>
														{ALL_WEEKDAYS.map(day => (
															<SelectItem key={day + 'weekday'} value={day}>
																{getWeekDayReadableString(day)}
															</SelectItem>
														))}
														<SelectSeparator />
														<SelectItem value="day">Day</SelectItem>
														<SelectItem value="SA,SU">Weekend</SelectItem>
														<SelectItem value="MO,TU,WE,TH,FR">Weekday</SelectItem>
													</SelectContent>
												</Select>
											</Label>
										</div>
									</RadioGroup>
								)}

								{frequency.label == 'Yearly' && (
									<>
										<ToggleGroup value={bymonth?.map(month => String(month))} onValueChange={values => values.length >= 1 && setByMonth(values.map(month => Number(month)))} type="multiple" className="mt-3 grid w-fit grid-cols-6 rounded-lg bg-secondary p-1">
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

											<Select value={String(position)} onValueChange={value => setPosition(Number(value))}>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Select week in month" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value={'1'}>First</SelectItem>
													<SelectItem value={'2'}>Second</SelectItem>
													<SelectItem value={'3'}>Third</SelectItem>
													<SelectItem value={'4'}>Fourth</SelectItem>
													<SelectItem value={'5'}>Fifth</SelectItem>
													<SelectSeparator />
													<SelectItem value={'-2'}>Second to last</SelectItem>
													<SelectItem value={'-1'}>Last</SelectItem>
												</SelectContent>
											</Select>

											<Select
												value={selectWeekDay}
												onValueChange={value => {
													setSelectWeekDay(value);

													if (value == 'day') {
														setWeekDays([]);
														setMonthDays([position]);
														return;
													}

													setMonthDays([]);
													setWeekDays(value.split(',') as any[]);
												}}>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Select day of the week" />
												</SelectTrigger>

												<SelectContent>
													{ALL_WEEKDAYS.map(day => (
														<SelectItem key={day + 'weekday'} value={day}>
															{getWeekDayReadableString(day)}
														</SelectItem>
													))}
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
											<Input
												max={365}
												value={count}
												onChange={event => (Number(event.target.value) <= 0 ? setCount(1) : Number(event.target.value) >= 365 ? setCount(365) : setCount(Number(event.target.value)))}
												min={1}
												inputMode="numeric"
												className="h-8 w-10 text-center"
												type="number"
												placeholder=""
											/>
											<span className="w-fit whitespace-nowrap text-sm">Occurence</span>
										</div>
									)}

									{endRepeat == 'on date' && <DatePicker selected={until} onSetDate={setUntil} />}
								</div>
							</div>
						</>
					)}
				</div>

				<AlertDialogFooter className="mt-6">
					<AlertDialogCancel className="w-full">Close</AlertDialogCancel>

					<AlertDialogAction onClick={getRecurrenceString} className="w-full">
						Set frequency
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
