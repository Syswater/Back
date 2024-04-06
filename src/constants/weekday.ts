export enum Weekday {
    Sunday = 'Sunday',
    Monday = 'Monday',
    Tuesday = 'Tuesday',
    Wednesday = 'Wednesday',
    Thursday = 'Thursday',
    Friday = 'Friday',
    Saturday = 'Saturday'
}

export function convertWeekdayEnumToString(enumValues: Weekday[]): string {
    const daysString = enumValues.map(value => Weekday[value]).join(',');
    return daysString;
}

export function splitWeekdaysString(weekdayString: string): string[] {
    return weekdayString.split(',').map(day => day.trim());
};

export function convertWeekdaysToEnum(weekdayStrings: string[]): Weekday[] {
    return weekdayStrings.map(weekdayString => Weekday[weekdayString as keyof typeof Weekday]);
};