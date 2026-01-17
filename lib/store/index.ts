/**
 * Zustand store for Telofy state management
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
// Note: MMKV requires native module, use AsyncStorage as fallback for Expo Go
// import { MMKV } from 'react-native-mmkv';
import type {
  Objective,
  Task,
  TimeBlock,
  NotificationPreference,
  DailyStatus,
  Deviation,
  ObjectiveStatus,
} from '../types';

// Simple in-memory storage for development
// TODO: Replace with MMKV after running `npx expo prebuild`
const memoryStorage: Record<string, string> = {};

const simpleStorage = {
  getItem: (name: string) => {
    return memoryStorage[name] ?? null;
  },
  setItem: (name: string, value: string) => {
    memoryStorage[name] = value;
  },
  removeItem: (name: string) => {
    delete memoryStorage[name];
  },
};

// Objective store
interface ObjectiveState {
  objectives: Objective[];
  activeObjectiveId: string | null;
  
  // Actions
  addObjective: (objective: Objective) => void;
  updateObjective: (id: string, updates: Partial<Objective>) => void;
  removeObjective: (id: string) => void;
  setActiveObjective: (id: string | null) => void;
  getActiveObjective: () => Objective | null;
}

export const useObjectiveStore = create<ObjectiveState>()(
  persist(
    immer((set, get) => ({
      objectives: [],
      activeObjectiveId: null,

      addObjective: (objective) =>
        set((state) => {
          state.objectives.push(objective);
          if (!state.activeObjectiveId) {
            state.activeObjectiveId = objective.id;
          }
        }),

      updateObjective: (id, updates) =>
        set((state) => {
          const index = state.objectives.findIndex((o) => o.id === id);
          if (index !== -1) {
            state.objectives[index] = {
              ...state.objectives[index],
              ...updates,
              updatedAt: new Date(),
            };
          }
        }),

      removeObjective: (id) =>
        set((state) => {
          state.objectives = state.objectives.filter((o) => o.id !== id);
          if (state.activeObjectiveId === id) {
            state.activeObjectiveId = state.objectives[0]?.id ?? null;
          }
        }),

      setActiveObjective: (id) =>
        set((state) => {
          state.activeObjectiveId = id;
        }),

      getActiveObjective: () => {
        const state = get();
        return state.objectives.find((o) => o.id === state.activeObjectiveId) ?? null;
      },
    })),
    {
      name: 'telofy-objectives',
      storage: createJSONStorage(() => simpleStorage),
    }
  )
);

// Task store
interface TaskState {
  tasks: Task[];
  
  // Actions
  addTask: (task: Task) => void;
  addTasks: (tasks: Task[]) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  completeTask: (id: string) => void;
  skipTask: (id: string, reason?: string) => void;
  getTasksForDate: (date: Date) => Task[];
  getTasksForObjective: (objectiveId: string) => Task[];
}

export const useTaskStore = create<TaskState>()(
  persist(
    immer((set, get) => ({
      tasks: [],

      addTask: (task) =>
        set((state) => {
          state.tasks.push(task);
        }),

      addTasks: (tasks) =>
        set((state) => {
          state.tasks.push(...tasks);
        }),

      updateTask: (id, updates) =>
        set((state) => {
          const index = state.tasks.findIndex((t) => t.id === id);
          if (index !== -1) {
            state.tasks[index] = { ...state.tasks[index], ...updates };
          }
        }),

      completeTask: (id) =>
        set((state) => {
          const index = state.tasks.findIndex((t) => t.id === id);
          if (index !== -1) {
            state.tasks[index].status = 'completed';
            state.tasks[index].completedAt = new Date();
          }
        }),

      skipTask: (id, reason) =>
        set((state) => {
          const index = state.tasks.findIndex((t) => t.id === id);
          if (index !== -1) {
            state.tasks[index].status = 'skipped';
            state.tasks[index].skippedReason = reason;
          }
        }),

      getTasksForDate: (date) => {
        const state = get();
        const dateStr = date.toISOString().split('T')[0];
        return state.tasks.filter(
          (t) => new Date(t.scheduledAt).toISOString().split('T')[0] === dateStr
        );
      },

      getTasksForObjective: (objectiveId) => {
        const state = get();
        return state.tasks.filter((t) => t.objectiveId === objectiveId);
      },
    })),
    {
      name: 'telofy-tasks',
      storage: createJSONStorage(() => simpleStorage),
    }
  )
);

// Schedule store
interface ScheduleState {
  timeBlocks: TimeBlock[];
  
  // Actions
  addTimeBlock: (block: TimeBlock) => void;
  updateTimeBlock: (id: string, updates: Partial<TimeBlock>) => void;
  removeTimeBlock: (id: string) => void;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    immer((set) => ({
      timeBlocks: [],

      addTimeBlock: (block) =>
        set((state) => {
          state.timeBlocks.push(block);
        }),

      updateTimeBlock: (id, updates) =>
        set((state) => {
          const index = state.timeBlocks.findIndex((b) => b.id === id);
          if (index !== -1) {
            state.timeBlocks[index] = { ...state.timeBlocks[index], ...updates };
          }
        }),

      removeTimeBlock: (id) =>
        set((state) => {
          state.timeBlocks = state.timeBlocks.filter((b) => b.id !== id);
        }),
    })),
    {
      name: 'telofy-schedule',
      storage: createJSONStorage(() => simpleStorage),
    }
  )
);

// Status store for daily tracking
interface StatusState {
  dailyStatuses: DailyStatus[];
  deviations: Deviation[];
  currentStatus: ObjectiveStatus;
  
  // Actions
  addDailyStatus: (status: DailyStatus) => void;
  addDeviation: (deviation: Deviation) => void;
  resolveDeviation: (id: string) => void;
  setCurrentStatus: (status: ObjectiveStatus) => void;
  getTodayStatus: () => DailyStatus | null;
}

export const useStatusStore = create<StatusState>()(
  persist(
    immer((set, get) => ({
      dailyStatuses: [],
      deviations: [],
      currentStatus: 'on_track',

      addDailyStatus: (status) =>
        set((state) => {
          state.dailyStatuses.push(status);
        }),

      addDeviation: (deviation) =>
        set((state) => {
          state.deviations.push(deviation);
          state.currentStatus = 'deviation_detected';
        }),

      resolveDeviation: (id) =>
        set((state) => {
          const index = state.deviations.findIndex((d) => d.id === id);
          if (index !== -1) {
            state.deviations[index].resolvedAt = new Date();
          }
          // Check if all deviations are resolved
          const unresolvedCount = state.deviations.filter(
            (d) => !d.resolvedAt
          ).length;
          if (unresolvedCount === 0) {
            state.currentStatus = 'on_track';
          }
        }),

      setCurrentStatus: (status) =>
        set((state) => {
          state.currentStatus = status;
        }),

      getTodayStatus: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        return (
          state.dailyStatuses.find(
            (s) => new Date(s.date).toISOString().split('T')[0] === today
          ) ?? null
        );
      },
    })),
    {
      name: 'telofy-status',
      storage: createJSONStorage(() => simpleStorage),
    }
  )
);

// App-wide settings
interface SettingsState {
  notificationPreference: NotificationPreference;
  timezone: string;
  onboardingCompleted: boolean;
  
  // Actions
  updateNotificationPreference: (pref: Partial<NotificationPreference>) => void;
  setTimezone: (tz: string) => void;
  completeOnboarding: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    immer((set) => ({
      notificationPreference: {
        enabled: true,
        advanceMinutes: 5,
        escalation: true,
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      onboardingCompleted: false,

      updateNotificationPreference: (pref) =>
        set((state) => {
          state.notificationPreference = {
            ...state.notificationPreference,
            ...pref,
          };
        }),

      setTimezone: (tz) =>
        set((state) => {
          state.timezone = tz;
        }),

      completeOnboarding: () =>
        set((state) => {
          state.onboardingCompleted = true;
        }),
    })),
    {
      name: 'telofy-settings',
      storage: createJSONStorage(() => simpleStorage),
    }
  )
);
