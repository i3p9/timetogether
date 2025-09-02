import { useState, useEffect } from "react";
import { Smartphone, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
	const [deferredPrompt, setDeferredPrompt] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [showPrompt, setShowPrompt] = useState(false);
	const [isInstalled, setIsInstalled] = useState(false);

	useEffect(() => {
		// Check if app is already installed
		const isStandalone = window.matchMedia(
			"(display-mode: standalone)"
		).matches;
		const isInWebAppiOS =
			(window.navigator as any).standalone === true;

		if (isStandalone || isInWebAppiOS) {
			setIsInstalled(true);
			return;
		}

		// Check if this is iOS Safari
		const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
		const isSafari = /^((?!chrome|android).)*safari/i.test(
			navigator.userAgent
		);

		if (isIOS && isSafari) {
			// For iOS Safari, show prompt immediately since there's no beforeinstallprompt
			const dismissed = localStorage.getItem(
				"time-together-install-dismissed"
			);
			if (
				!dismissed ||
				Date.now() - parseInt(dismissed) > 24 * 60 * 60 * 1000
			) {
				setTimeout(() => setShowPrompt(true), 2000);
			}
			return;
		}

		// Handle the beforeinstallprompt event
		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			setDeferredPrompt(e as BeforeInstallPromptEvent);
			setShowPrompt(true);
		};

		// Handle app installed event
		const handleAppInstalled = () => {
			setIsInstalled(true);
			setShowPrompt(false);
			setDeferredPrompt(null);
		};

		window.addEventListener(
			"beforeinstallprompt",
			handleBeforeInstallPrompt
		);
		window.addEventListener("appinstalled", handleAppInstalled);

		// Development fallback - show prompt after 3 seconds if no event fired
		const isDev =
			location.hostname === "localhost" ||
			location.hostname.includes("192.168");
		if (isDev) {
			const timer = setTimeout(() => {
				if (!deferredPrompt && !isInstalled) {
					setShowPrompt(true);
				}
			}, 3000);

			return () => {
				clearTimeout(timer);
				window.removeEventListener(
					"beforeinstallprompt",
					handleBeforeInstallPrompt
				);
				window.removeEventListener(
					"appinstalled",
					handleAppInstalled
				);
			};
		}

		return () => {
			window.removeEventListener(
				"beforeinstallprompt",
				handleBeforeInstallPrompt
			);
			window.removeEventListener("appinstalled", handleAppInstalled);
		};
	}, []);

	const handleInstallClick = async () => {
		// Check if this is iOS Safari
		const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
		const isSafari = /^((?!chrome|android).)*safari/i.test(
			navigator.userAgent
		);

		if (isIOS && isSafari) {
			// Show iOS-specific instructions
			alert(
				'To install TimeTogether:\n\n1. Tap the Share button (⬆️) at the bottom\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to install the app'
			);
			return;
		}

		if (!deferredPrompt) {
			// Fallback for development - show instructions
			alert(
				"To install this PWA:\n\n• Chrome: Click the install icon in the address bar\n• Safari: Share → Add to Home Screen\n• Edge: Click ... → Apps → Install TimeTogether"
			);
			return;
		}

		try {
			await deferredPrompt.prompt();
			const { outcome } = await deferredPrompt.userChoice;

			if (outcome === "accepted") {
				setShowPrompt(false);
				setDeferredPrompt(null);
			}
		} catch (error) {
			console.error("Error installing app:", error);
		}
	};

	const handleDismiss = () => {
		setShowPrompt(false);
		// Store dismissal to not show again for a while
		localStorage.setItem(
			"time-together-install-dismissed",
			Date.now().toString()
		);
	};

	// Don't show if installed or dismissed recently
	useEffect(() => {
		const dismissed = localStorage.getItem(
			"time-together-install-dismissed"
		);
		if (dismissed) {
			const dismissedTime = parseInt(dismissed);
			const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
			if (dismissedTime > dayAgo) {
				setShowPrompt(false);
			}
		}
	}, []);

	if (isInstalled || !showPrompt) {
		return null;
	}

	// Check if this is iOS Safari for different messaging
	const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
	const isSafari = /^((?!chrome|android).)*safari/i.test(
		navigator.userAgent
	);

	return (
		<div className='fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up'>
			<div className='max-w-md mx-auto bg-white/95 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-2xl ios-card'>
				<div className='p-6'>
					<div className='flex items-start gap-4'>
						<div className='w-12 h-12 bg-gradient-to-br from-sky-600 to-cyan-600 rounded-2xl flex items-center justify-center text-white flex-shrink-0'>
							<Smartphone size={24} />
						</div>
						<div className='flex-1'>
							<h3 className='text-lg font-semibold text-black mb-1'>
								Install TimeTogether
							</h3>
							<p className='text-sm text-gray-600 mb-4'>
								{isIOS && isSafari
									? "Add to your Home Screen for the best experience!"
									: "Get the full app experience - works offline and feels native!"}
							</p>
							<div className='flex gap-3'>
								<button
									onClick={handleInstallClick}
									className='flex-1 bg-sky-600 text-white py-3 px-4 rounded-2xl text-sm font-medium native-button shadow-lg shadow-sky-600/25'
								>
									{isIOS && isSafari
										? "Show Instructions"
										: "Install App"}
								</button>
								<button
									onClick={handleDismiss}
									className='px-4 py-3 text-gray-500 text-sm font-medium native-button'
								>
									Not now
								</button>
							</div>
						</div>
						<button
							onClick={handleDismiss}
							className='w-8 h-8 bg-gray-100/80 rounded-full flex items-center justify-center text-gray-500 native-button flex-shrink-0'
						>
							<X size={16} />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
