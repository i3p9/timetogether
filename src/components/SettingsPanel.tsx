interface Settings {
	is24HourFormat: boolean;
}

interface SettingsPanelProps {
	showSettings: boolean;
	settings: Settings;
	onSettingsChange: (settings: Settings) => void;
}

export function SettingsPanel({
	showSettings,
	settings,
	onSettingsChange,
}: SettingsPanelProps) {
	if (!showSettings) return null;

	return (
		<div className='bg-white/95 backdrop-blur border-b border-gray-100 mx-4 my-2 rounded-2xl p-6 ios-card'>
			<div className='flex items-center justify-between'>
				<span className='text-base text-black'>24-hour format</span>
				<label className='relative inline-block w-12 h-6'>
					<input
						type='checkbox'
						checked={settings.is24HourFormat}
						onChange={(e) =>
							onSettingsChange({
								...settings,
								is24HourFormat: e.target.checked,
							})
						}
						className='opacity-0 w-0 h-0'
					/>
					<span
						className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all ${
							settings.is24HourFormat ? "bg-sky-600" : "bg-gray-300"
						} before:absolute before:content-[''] before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:transition-all before:rounded-full ${
							settings.is24HourFormat ? "before:translate-x-6" : ""
						}`}
					></span>
				</label>
			</div>
		</div>
	);
}
