/**
 * Determines if it's day or night based on a timezone and time
 * @param date - The date to check (usually current time)
 * @param timezone - The IANA timezone string (e.g., "America/New_York")
 * @returns "day" or "night" as a string
 */
export function getDayOrNight(
	date: Date,
	timezone: string
): "day" | "night" {
	try {
		// Get the time in the specified timezone
		const timeInTimezone = new Date(
			date.toLocaleString("en-US", { timeZone: timezone })
		);

		// Extract the hour (0-23)
		const hour = timeInTimezone.getHours();

		// Define day hours: 6 AM to 6 PM (6:00 - 17:59)
		// Define night hours: 6 PM to 6 AM (18:00 - 5:59)
		if (hour >= 6 && hour < 18) {
			return "day";
		} else {
			return "night";
		}
	} catch (error) {
		// Fallback to current time if timezone conversion fails
		console.warn(
			`Failed to get time for timezone ${timezone}:`,
			error
		);
		const hour = date.getHours();
		if (hour >= 6 && hour < 18) {
			return "day";
		} else {
			return "night";
		}
	}
}

/**
 * Alternative function that returns a more descriptive string
 * @param date - The date to check
 * @param timezone - The IANA timezone string
 * @returns "morning", "afternoon", "evening", or "night"
 */
export function getTimeOfDayDetailed(
	date: Date,
	timezone: string
): "morning" | "afternoon" | "evening" | "night" {
	try {
		const timeInTimezone = new Date(
			date.toLocaleString("en-US", { timeZone: timezone })
		);

		const hour = timeInTimezone.getHours();

		if (hour >= 6 && hour < 12) {
			return "morning";
		} else if (hour >= 12 && hour < 17) {
			return "afternoon";
		} else if (hour >= 17 && hour < 21) {
			return "evening";
		} else {
			return "night";
		}
	} catch (error) {
		console.warn(
			`Failed to get time for timezone ${timezone}:`,
			error
		);
		const hour = date.getHours();

		if (hour >= 6 && hour < 12) {
			return "morning";
		} else if (hour >= 12 && hour < 17) {
			return "afternoon";
		} else if (hour >= 17 && hour < 21) {
			return "evening";
		} else {
			return "night";
		}
	}
}
