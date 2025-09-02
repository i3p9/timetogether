// Simple localStorage utility for TimeTogether
interface Friend {
  id: string;
  name: string;
  timezone: string; // IANA timezone ID
  timezoneDisplay: string; // Friendly display name
  customLocation?: string; // User's custom location name
  addedAt: Date;
}

interface Settings {
  is24HourFormat: boolean;
}

class TimeTogetherStorage {
  private friendsKey = 'time-together-friends';
  private settingsKey = 'time-together-settings';

  saveFriends(friends: Friend[]): void {
    try {
      localStorage.setItem(this.friendsKey, JSON.stringify(friends));
    } catch (error) {
      console.error('Failed to save friends to localStorage:', error);
    }
  }

  loadFriends(): Friend[] {
    try {
      const saved = localStorage.getItem(this.friendsKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((f: any) => ({
          ...f,
          addedAt: new Date(f.addedAt),
          // Backward compatibility: if no timezoneDisplay, use timezone ID
          timezoneDisplay: f.timezoneDisplay || f.timezone.replace('_', ' ')
        }));
      }
    } catch (error) {
      console.error('Failed to load friends from localStorage:', error);
    }
    return [];
  }

  saveSettings(settings: Settings): void {
    try {
      localStorage.setItem(this.settingsKey, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  }

  loadSettings(): Settings {
    try {
      const saved = localStorage.getItem(this.settingsKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
    }
    return { is24HourFormat: false };
  }

  clearAll(): void {
    try {
      localStorage.removeItem(this.friendsKey);
      localStorage.removeItem(this.settingsKey);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
}

export const storage = new TimeTogetherStorage();