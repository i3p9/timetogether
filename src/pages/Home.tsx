import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { storage } from "../storage";
import { searchTimezones, TimezoneData } from "../timezones";
import { TimeDisplay } from "../components/TimeDisplay";
import { FriendsList } from "../components/FriendsList";
import { FriendModal } from "../components/FriendModal";
import { InstallPrompt } from "../components/InstallPrompt";

interface Friend {
	id: string;
	name: string;
	timezone: string;
	timezoneDisplay: string;
	customLocation?: string;
	addedAt: Date;
}

interface Settings {
	is24HourFormat: boolean;
}

interface HomePageProps {
	settings: Settings;
}

export function HomePage({ settings }: HomePageProps) {
	const navigate = useNavigate();
	const [currentTime, setCurrentTime] = useState(new Date());
	const [friends, setFriends] = useState<Friend[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [editingFriend, setEditingFriend] = useState<Friend | null>(
		null
	);
	const [friendName, setFriendName] = useState("");
	const [selectedTimezone, setSelectedTimezone] =
		useState<TimezoneData | null>(null);
	const [timezoneSearch, setTimezoneSearch] = useState("");
	const [customLocation, setCustomLocation] = useState("");
	const [showTimezoneDropdown, setShowTimezoneDropdown] =
		useState(false);
	const [isInitialized, setIsInitialized] = useState(false);

	// Load data from storage on mount
	useEffect(() => {
		const savedFriends = storage.loadFriends();
		setFriends(savedFriends);
		setIsInitialized(true);
	}, []);

	// Save friends to storage whenever friends change (but only after initial load)
	useEffect(() => {
		if (isInitialized) {
			storage.saveFriends(friends);
		}
	}, [friends, isInitialized]);

	// Update current time every second
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	// Handle viewport height for iOS Safari
	useEffect(() => {
		const setViewportHeight = () => {
			const vh = window.innerHeight * 0.01;
			document.documentElement.style.setProperty("--vh", `${vh}px`);
		};

		setViewportHeight();
		window.addEventListener("resize", setViewportHeight);
		window.addEventListener("orientationchange", setViewportHeight);

		return () => {
			window.removeEventListener("resize", setViewportHeight);
			window.removeEventListener(
				"orientationchange",
				setViewportHeight
			);
		};
	}, []);

	const formatTime = (
		date: Date,
		timezone: string,
		is24Hour: boolean = settings.is24HourFormat
	): string[] => {
		const options: Intl.DateTimeFormatOptions = {
			timeZone: timezone,
			hour: "numeric",
			minute: "2-digit",
			hour12: !is24Hour,
		};

		// Break formatted result into parts
		const parts = new Intl.DateTimeFormat(
			"en-US",
			options
		).formatToParts(date);

		const time = parts
			.filter((p) => p.type !== "dayPeriod") // keep literals like ":" intact
			.map((p) => p.value)
			.join("")
			.trim();

		const ampm = parts.find((p) => p.type === "dayPeriod")?.value;

		// Return `[time, ampm]` (ampm will be undefined if 24hr)
		return ampm ? [time, ampm] : [time];
	};

	const getUserTimezone = () => {
		return Intl.DateTimeFormat().resolvedOptions().timeZone;
	};

	const getTimeOfDay = (date: Date, timezone: string) => {
		const hour = new Date(
			date.toLocaleString("en-US", { timeZone: timezone })
		).getHours();

		if (hour >= 5 && hour < 8) return ["Early morning", "red"];
		if (hour >= 8 && hour < 12) return ["Morning", "yellow"];
		if (hour >= 12 && hour < 17) return ["Afternoon", "green"];
		if (hour >= 17 && hour < 21) return ["Evening", "amber"];
		if (hour >= 21 || hour < 2) return ["Night", "orange"];
		return ["Late night", "red"];
	};

	const openModal = (friend?: Friend) => {
		if (friend) {
			setEditingFriend(friend);
			setFriendName(friend.name);
			const timezoneData = searchTimezones("").find(
				(tz) => tz.id === friend.timezone
			);
			setSelectedTimezone(timezoneData || null);
			setTimezoneSearch(friend.timezoneDisplay || "");
			setCustomLocation(friend.customLocation || "");
		} else {
			setEditingFriend(null);
			setFriendName("");
			setSelectedTimezone(null);
			setTimezoneSearch("");
			setCustomLocation("");
		}
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setEditingFriend(null);
		setFriendName("");
		setSelectedTimezone(null);
		setTimezoneSearch("");
		setCustomLocation("");
		setShowTimezoneDropdown(false);
	};

	const saveFriend = () => {
		if (!friendName.trim() || !selectedTimezone) return;

		if (editingFriend) {
			setFriends(
				friends.map((f) =>
					f.id === editingFriend.id
						? {
								...f,
								name: friendName.trim(),
								timezone: selectedTimezone.id,
								timezoneDisplay: selectedTimezone.displayName,
								customLocation: customLocation.trim() || undefined,
						  }
						: f
				)
			);
		} else {
			const newFriend: Friend = {
				id: Date.now().toString(),
				name: friendName.trim(),
				timezone: selectedTimezone.id,
				timezoneDisplay: selectedTimezone.displayName,
				customLocation: customLocation.trim() || undefined,
				addedAt: new Date(),
			};
			setFriends([...friends, newFriend]);
		}

		closeModal();
	};

	const deleteFriend = (id: string) => {
		setFriends(friends.filter((f) => f.id !== id));
	};

	const handleSettingsToggle = () => {
		navigate("/settings");
	};

	return (
		<div className='h-[100svh] md:h-[100dvh] flex flex-col font-system bg-gray-50 overflow-hidden safe-area-top safe-area-bottom'>
			<TimeDisplay
				currentTime={currentTime}
				formatTime={formatTime}
				getUserTimezone={getUserTimezone}
				showSettings={false}
				onSettingsToggle={handleSettingsToggle}
			/>

			<FriendsList
				friends={friends}
				currentTime={currentTime}
				formatTime={formatTime}
				getTimeOfDay={getTimeOfDay}
				onEditFriend={openModal}
				onDeleteFriend={deleteFriend}
				onAddFriend={() => openModal()}
			/>

			<FriendModal
				showModal={showModal}
				editingFriend={editingFriend}
				friendName={friendName}
				setFriendName={setFriendName}
				selectedTimezone={selectedTimezone}
				setSelectedTimezone={setSelectedTimezone}
				timezoneSearch={timezoneSearch}
				setTimezoneSearch={setTimezoneSearch}
				customLocation={customLocation}
				setCustomLocation={setCustomLocation}
				showTimezoneDropdown={showTimezoneDropdown}
				setShowTimezoneDropdown={setShowTimezoneDropdown}
				onSave={saveFriend}
				onClose={closeModal}
			/>

			<InstallPrompt />
		</div>
	);
}
