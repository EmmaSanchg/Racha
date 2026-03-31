export type Habit = {
  id: string;
  name: string;
  color: string;
  icon: string;
  reminderEnabled: boolean;
  reminderTime: string;
  notificationId?: string;
  completions: string[];
};
