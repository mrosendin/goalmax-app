/**
 * Core types for the Telofy execution system
 */

// Objective function categories
export type ObjectiveCategory =
  | 'fitness'
  | 'career'
  | 'academic'
  | 'health'
  | 'financial'
  | 'creative'
  | 'custom';

// User's primary objective
export interface Objective {
  id: string;
  name: string;
  category: ObjectiveCategory;
  description: string;
  targetOutcome: string;
  timeframe: TimeFrame;
  priority: number; // 1-5, 5 being highest
  createdAt: Date;
  updatedAt: Date;
}

// Time configuration
export interface TimeFrame {
  startDate: Date;
  endDate?: Date;
  dailyCommitmentMinutes: number;
}

// Actionable task generated from objective
export interface Task {
  id: string;
  objectiveId: string;
  title: string;
  description?: string;
  scheduledAt: Date;
  durationMinutes: number;
  status: TaskStatus;
  completedAt?: Date;
  skippedReason?: string;
}

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'skipped'
  | 'overdue';

// Daily schedule block
export interface TimeBlock {
  id: string;
  startTime: string; // HH:mm format
  endTime: string;
  type: TimeBlockType;
  isRecurring: boolean;
  recurringDays?: number[]; // 0-6, Sunday = 0
}

export type TimeBlockType =
  | 'available'
  | 'work'
  | 'sleep'
  | 'personal'
  | 'blocked';

// System status for the objective
export type ObjectiveStatus =
  | 'on_track'
  | 'deviation_detected'
  | 'recalibrating'
  | 'paused';

// Daily execution summary
export interface DailyStatus {
  date: Date;
  objectiveId: string;
  status: ObjectiveStatus;
  completedTasks: number;
  totalTasks: number;
  deviations: Deviation[];
  notes?: string;
}

// When the user deviates from the plan
export interface Deviation {
  id: string;
  taskId: string;
  type: DeviationType;
  detectedAt: Date;
  resolvedAt?: Date;
  aiSuggestion?: string;
}

export type DeviationType =
  | 'missed'
  | 'delayed'
  | 'partial'
  | 'cancelled';

// Push notification configuration
export interface NotificationPreference {
  enabled: boolean;
  advanceMinutes: number; // How many minutes before task
  escalation: boolean; // Send follow-up if missed
  quietHoursStart?: string; // HH:mm
  quietHoursEnd?: string;
}

// User profile
export interface UserProfile {
  id: string;
  objectives: Objective[];
  timeBlocks: TimeBlock[];
  notificationPreference: NotificationPreference;
  timezone: string;
  onboardingCompleted: boolean;
  createdAt: Date;
}

// AI conversation context
export interface AIContext {
  objective: Objective;
  recentTasks: Task[];
  recentDeviations: Deviation[];
  userFeedback?: string;
}

// AI response for task generation
export interface AITaskPlan {
  tasks: Omit<Task, 'id' | 'status'>[];
  reasoning: string;
  adjustments?: string;
}
