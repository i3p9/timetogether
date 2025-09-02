import { Settings } from "lucide-react";
import {
	getCountryFlag,
	getCountryForTimezone,
} from "../utils/countryFlags";

interface TimeDisplayProps {
	currentTime: Date;
	formatTime: (
		date: Date,
		timezone: string,
		is24Hour?: boolean
	) => Array<string>;
	getUserTimezone: () => string;
	showSettings: boolean;
	onSettingsToggle: () => void;
}

export function TimeDisplay({
	currentTime,
	formatTime,
	getUserTimezone,
	onSettingsToggle,
}: TimeDisplayProps) {
	const userTimeZone = getUserTimezone();
	const [time, ampm] = formatTime(currentTime, userTimeZone);
	const country = getCountryForTimezone(userTimeZone);
	return (
		<header className='bg-[#075985] text-white relative flex items-center justify-center p-6 pt-12 pb-8'>
			<button
				className='p-2 absolute top-12 right-6 bg-white/20 backdrop-blur border-none text-white w-11 h-11 rounded-full flex items-center justify-center cursor-pointer native-button'
				onClick={onSettingsToggle}
			>
				<Settings size={20} />
			</button>
			<div className='text-center w-full'>
				<h1 className='text-lg font-normal mb-4 opacity-90'>
					Your Time
				</h1>
				<div className='text-6xl md:text-7xl font-semibold mb-4 font-mono'>
					{time}
					<span className='ml-2 text-4xl md:text-5xl'>
						{ampm ? ampm : null}
					</span>
				</div>
				<div className='flex items-center justify-center gap-2 text-base opacity-90'>
					<span className='text-lg'>{getCountryFlag(country)}</span>
					<span>{getUserTimezone().replace("_", " ")}</span>
				</div>
			</div>
		</header>
	);
}
