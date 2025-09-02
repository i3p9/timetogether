import { Plus, Sun, Moon, EggOff } from "lucide-react";
import { useState } from "react";
import { getCountryFlag } from "../utils/countryFlags";
import { TIMEZONE_DATA } from "../timezones";
import { ContextMenu } from "./ContextMenu";
import { getDayOrNight } from "../utils/dayNight";

interface Friend {
	id: string;
	name: string;
	timezone: string;
	timezoneDisplay: string;
	customLocation?: string;
	addedAt: Date;
}

interface FriendsListProps {
	friends: Friend[];
	currentTime: Date;
	formatTime: (
		date: Date,
		timezone: string,
		is24Hour?: boolean
	) => Array<string>;
	getTimeOfDay: (date: Date, timezone: string) => Array<string>;
	onEditFriend: (friend: Friend) => void;
	onDeleteFriend: (id: string) => void;
	onAddFriend: () => void;
}

export function FriendsList({
	friends,
	currentTime,
	formatTime,
	getTimeOfDay,
	onEditFriend,
	onDeleteFriend,
	onAddFriend,
}: FriendsListProps) {
	const sortedFriends = [...friends].sort((a, b) =>
		a.name.localeCompare(b.name)
	);

	const [contextMenu, setContextMenu] = useState<{
		friend: Friend;
		x: number;
		y: number;
	} | null>(null);

	const [longPressActive, setLongPressActive] = useState<
		string | null
	>(null);

	const getCountryForTimezone = (timezoneId: string): string => {
		const timezoneData = TIMEZONE_DATA.find(
			(tz) => tz.id === timezoneId
		);
		return timezoneData?.country || "Unknown";
	};

	const getTimezoneOffset = (timezone: string): number => {
		const now = new Date();
		const userOffset = now.getTimezoneOffset();
		const friendDate = new Date(
			now.toLocaleString("en-US", { timeZone: timezone })
		);
		const friendOffset =
			(now.getTime() - friendDate.getTime()) / (1000 * 60);
		return Math.round((userOffset - friendOffset) / 60);
	};

	const getDateForTimezone = (
		date: Date,
		timezone: string
	): Array<string> => {
		const userDate = new Date().toDateString();
		const friendDate = new Date(
			date.toLocaleString("en-US", { timeZone: timezone })
		).toDateString();

		const offset = getTimezoneOffset(timezone);
		const offsetText = offset > 0 ? `+${offset}` : `${offset}`;

		if (friendDate === userDate) {
			return ["Today", offsetText];
		}

		// Check if it's tomorrow or yesterday
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);

		if (friendDate === tomorrow.toDateString()) {
			return ["Tomorrow", offsetText];
		}

		if (friendDate === yesterday.toDateString()) {
			return ["Yesterday", offsetText];
		}

		// Otherwise return the date
		const formattedDate = new Date(
			date.toLocaleString("en-US", { timeZone: timezone })
		).toLocaleDateString("en-US", {
			timeZone: timezone,
			month: "short",
			day: "numeric",
		});
		return [formattedDate, offsetText];
	};

	const handleLongPress = (
		friend: Friend,
		event: React.TouchEvent | React.MouseEvent
	) => {
		const x =
			"touches" in event
				? event.touches[0].clientX
				: (event as React.MouseEvent).clientX;
		const y =
			"touches" in event
				? event.touches[0].clientY
				: (event as React.MouseEvent).clientY;

		setContextMenu({
			friend,
			x,
			y,
		});
	};

	const closeContextMenu = () => {
		setContextMenu(null);
	};

	// Single long press handler for all friends
	const createLongPressHandlers = (friend: Friend) => {
		const start = (event: React.TouchEvent | React.MouseEvent) => {
			event.preventDefault();

			// Add push-in effect immediately
			setLongPressActive(friend.id);

			const timeout = window.setTimeout(() => {
				// Trigger long press - don't check state since it's async
				handleLongPress(friend, event);
				setLongPressActive(null);
			}, 600);

			// Store timeout on the element to clear it later
			const element = event.currentTarget as HTMLElement;
			(element as any).longPressTimeout = timeout;
		};

		const clear = () => {
			setLongPressActive(null);
			// Clear any existing timeout
			const element = document.querySelector(
				`[data-friend-id="${friend.id}"]`
			) as HTMLElement;
			if (element && (element as any).longPressTimeout) {
				window.clearTimeout((element as any).longPressTimeout);
				(element as any).longPressTimeout = null;
			}
		};

		const end = (event: React.TouchEvent | React.MouseEvent) => {
			const element = event.currentTarget as HTMLElement;
			if ((element as any).longPressTimeout) {
				window.clearTimeout((element as any).longPressTimeout);
				(element as any).longPressTimeout = null;
			}
			setLongPressActive(null);
		};

		return {
			onMouseDown: start,
			onTouchStart: start,
			onMouseUp: end,
			onTouchEnd: end,
			onMouseLeave: clear,
			onTouchCancel: clear,
			onContextMenu: (e: React.MouseEvent) => {
				// Prevent browser context menu on right-click
				e.preventDefault();
			},
		};
	};

	const colorMap: Record<string, string> = {
		red: "text-red-500",
		green: "text-green-500",
		amber: "text-amber-500",
		yellow: "text-yellow-500",
		orange: "text-orange-500",
	};

	return (
		<main className='flex-1 bg-white flex flex-col overflow-hidden'>
			{/* Scrollable friends list */}
			<div className='flex-1 overflow-y-auto px-4 native-scroll'>
				<div className='py-4'>
					{sortedFriends.length === 0 ? (
						/* Empty state */
						<div className='flex-1 flex flex-col items-center justify-center h-full min-h-[300px] text-center px-6'>
							<div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6'>
								<EggOff size={32} className='text-gray-400' />
							</div>
							<h3 className='text-xl font-semibold text-gray-800 mb-2'>
								No timezones added yet
							</h3>
							<p className='text-gray-500 mb-8 max-w-sm'>
								Add friends, family, or colleagues to track their time
								zones and stay connected across the globe.
							</p>
							<button
								onClick={onAddFriend}
								className='bg-sky-600 text-white px-8 py-3 rounded-2xl text-base font-medium native-button shadow-lg shadow-sky-600/25'
							>
								Add your first timezone
							</button>
						</div>
					) : (
						sortedFriends.map((friend, index) => {
							const longPressProps = createLongPressHandlers(friend);
							const [time, ampm] = formatTime(
								currentTime,
								friend.timezone
							);
							const [timeOfDay, color] = getTimeOfDay(
								currentTime,
								friend.timezone
							);
							const [relativeDay, offset] = getDateForTimezone(
								currentTime,
								friend.timezone
							);

							return (
								<div key={friend.id}>
									<div
										data-friend-id={friend.id}
										className={`bg-white/80 backdrop-blur rounded-2xl p-2 border border-gray-100/50 ios-card flex justify-between items-center cursor-pointer select-none long-press-card ${
											longPressActive === friend.id
												? "long-press-active"
												: ""
										}`}
										{...longPressProps}
									>
										<div className='flex-1'>
											<div className='flex items-center justify-between'>
												<h3 className='text-xl font-medium text-black m-0'>
													{friend.name}
												</h3>
											</div>
											<div className='flex items-center gap-1 text-gray-600 text-sm mb-1'>
												<span className='text-sm'>
													{getCountryFlag(
														getCountryForTimezone(friend.timezone)
													)}
												</span>
												<span>
													{friend.customLocation ||
														friend.timezoneDisplay ||
														friend.timezone.replace("_", " ")}
												</span>
											</div>
											<div
												className={`${colorMap[color]} text-xs font-medium`}
											>
												{timeOfDay}
											</div>
										</div>
										<div className='text-right flex flex-col items-end gap-1'>
											<div className='flex items-center gap-2'>
												{getDayOrNight(
													currentTime,
													friend.timezone
												) === "day" ? (
													<Sun
														size={16}
														className='text-yellow-500'
													/>
												) : (
													<Moon size={16} className='text-blue-500' />
												)}
												<span className='text-2xl font-mono font-semibold text-black'>
													{time}
													<span className='ml-1 text-sm'>
														{ampm ? ampm : null}
													</span>
												</span>
											</div>
											<span className='text-sm text-gray-400'>
												{relativeDay}{" "}
												<span className='text-xs'>{offset}</span>
											</span>
										</div>
									</div>
									{/* Divider between friends */}
									{index < sortedFriends.length - 1 && (
										<div className='h-3' />
									)}
								</div>
							);
						})
					)}
				</div>
			</div>

			{/* Fixed add button */}
			{sortedFriends.length > 0 && (
				<div className='px-4 pb-2 pt-4 bg-white/95 backdrop-blur'>
					<button
						className='w-full bg-sky-600 text-white border-none py-4 rounded-2xl text-base cursor-pointer flex items-center justify-center gap-2 native-button shadow-lg shadow-sky-600/25'
						onClick={onAddFriend}
					>
						<Plus size={20} />
						Add new
					</button>
				</div>
			)}

			{/* Context Menu */}
			{contextMenu && (
				<ContextMenu
					x={contextMenu.x}
					y={contextMenu.y}
					onEdit={() => onEditFriend(contextMenu.friend)}
					onDelete={() => onDeleteFriend(contextMenu.friend.id)}
					onClose={closeContextMenu}
				/>
			)}
		</main>
	);
}
