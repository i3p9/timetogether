import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
	ChevronLeft,
	CheckCircle,
	Smartphone,
	Globe,
} from "lucide-react";

interface Settings {
	is24HourFormat: boolean;
}

interface SettingsPageProps {
	settings: Settings;
	onSettingsChange: (settings: Settings) => void;
}

export function SettingsPage({
	settings,
	onSettingsChange,
}: SettingsPageProps) {
	const [isInstalled, setIsInstalled] = useState(false);

	useEffect(() => {
		// Check if app is installed
		const isStandalone = window.matchMedia(
			"(display-mode: standalone)"
		).matches;
		const isInWebAppiOS =
			(window.navigator as any).standalone === true;
		setIsInstalled(isStandalone || isInWebAppiOS);
	}, []);

	const getInstallInstructions = () => {
		const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
		const isSafari = /^((?!chrome|android).)*safari/i.test(
			navigator.userAgent
		);

		if (isIOS && isSafari) {
			return {
				title: "How to Install on iOS",
				steps: [
					"Tap the Share button (⬆️) at the bottom",
					'Scroll down and tap "Add to Home Screen"',
					'Tap "Add" to install the app',
				],
			};
		}

		return {
			title: "How to Install",
			steps: [
				"Look for the install icon in your browser address bar",
				'Click "Install TimeTogether" when prompted',
				"The app will be added to your device",
			],
		};
	};

	const installInstructions = getInstallInstructions();

	return (
		<div className='h-[100svh] md:h-[100dvh] flex flex-col font-system bg-gray-50 overflow-hidden safe-area-top safe-area-bottom'>
			{/* Header */}
			<header className='bg-white border-b border-gray-200 px-4 py-4 flex items-center'>
				<Link
					to='/'
					className='text-sky-600 text-base font-medium native-button flex items-center gap-1 no-underline'
				>
					<ChevronLeft size={20} />
					Back
				</Link>
				<h1 className='flex-1 text-center text-lg font-semibold text-black mr-12'>
					Settings
				</h1>
			</header>

			{/* Content */}
			<main className='flex-1 overflow-y-auto native-scroll'>
				<div className='p-4 space-y-6'>
					{/* Preferences Section */}
					<div>
						<h2 className='text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 px-2'>
							Preferences
						</h2>
						<div className='bg-white/95 backdrop-blur rounded-2xl border border-gray-200/50 ios-card overflow-hidden'>
							<div className='flex items-center justify-between p-4'>
								<div>
									<h3 className='text-base font-medium text-black'>
										24-Hour Format
									</h3>
									<p className='text-sm text-gray-500'>
										Show times in 24-hour format
									</p>
								</div>
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
											settings.is24HourFormat
												? "bg-sky-600"
												: "bg-gray-300"
										} before:absolute before:content-[''] before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:transition-all before:rounded-full ${
											settings.is24HourFormat
												? "before:translate-x-6"
												: ""
										}`}
									></span>
								</label>
							</div>
						</div>
					</div>

					{/* Install Section */}
					<div>
						<h2 className='text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 px-2'>
							Installation
						</h2>
						<div className='bg-white/95 backdrop-blur rounded-2xl border border-gray-200/50 ios-card overflow-hidden'>
							{isInstalled ? (
								/* App Installed */
								<div className='p-4 flex items-start gap-4'>
									<div className='w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0'>
										<CheckCircle size={24} />
									</div>
									<div className='flex-1'>
										<h3 className='text-base font-semibold text-black mb-1'>
											App Installed
										</h3>
										<p className='text-sm text-gray-600'>
											Congrats! You have the app installed and can use
											it offline.
										</p>
									</div>
								</div>
							) : (
								/* Installation Instructions */
								<div className='p-4'>
									<div className='flex items-start gap-4 mb-4'>
										<div className='w-12 h-12 bg-gradient-to-br from-sky-600 to-cyan-600 rounded-2xl flex items-center justify-center text-white flex-shrink-0'>
											<Smartphone size={24} />
										</div>
										<div className='flex-1'>
											<h3 className='text-base font-semibold text-black mb-1'>
												{installInstructions.title}
											</h3>
											<p className='text-sm text-gray-600 mb-3'>
												Get the full app experience with offline
												support
											</p>
										</div>
									</div>

									<div className='space-y-3'>
										{installInstructions.steps.map((step, index) => (
											<div
												key={index}
												className='flex items-start gap-3'
											>
												<div className='w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 text-xs font-semibold flex-shrink-0 mt-0.5'>
													{index + 1}
												</div>
												<p className='text-sm text-gray-700 flex-1'>
													{step}
												</p>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</div>

					{/* About Section */}
					<div>
						<h2 className='text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 px-2'>
							About
						</h2>
						<div className='bg-white/95 backdrop-blur rounded-2xl border border-gray-200/50 ios-card overflow-hidden'>
							<div className='p-4 text-center'>
								<div className='w-16 h-16 bg-gradient-to-br from-sky-600 to-cyan-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-3'>
									<Globe size={32} />
								</div>
								<h3 className='text-lg font-semibold text-black mb-1'>
									TimeTogether
								</h3>
								<p className='text-sm text-gray-600'>
									Track time zones for friends, family, and colleagues worldwide
								</p>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
