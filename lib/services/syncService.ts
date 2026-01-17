/**
 * Sync Service
 * Handles syncing local data with the backend API
 */

import { api } from '../api/client';
import { useObjectiveStore, useTaskStore } from '../store';
import { useAuthStore } from '../hooks/useAuth';
import type { Objective, Task } from '../types';

// ============================================
// SYNC STATUS
// ============================================

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

interface SyncState {
  status: SyncStatus;
  lastSyncAt: Date | null;
  error: string | null;
}

let syncState: SyncState = {
  status: 'idle',
  lastSyncAt: null,
  error: null,
};

const listeners: Set<(state: SyncState) => void> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => listener(syncState));
}

export function subscribeSyncState(listener: (state: SyncState) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSyncState() {
  return syncState;
}

// ============================================
// SYNC OPERATIONS
// ============================================

/**
 * Sync all data with the backend
 */
export async function syncAll(): Promise<{ success: boolean; error?: string }> {
  const { isAuthenticated } = useAuthStore.getState();
  
  if (!isAuthenticated) {
    return { success: false, error: 'Not authenticated' };
  }

  syncState = { ...syncState, status: 'syncing', error: null };
  notifyListeners();

  try {
    // Sync objectives first
    await syncObjectives();
    
    // Then sync tasks
    await syncTasks();

    syncState = {
      status: 'success',
      lastSyncAt: new Date(),
      error: null,
    };
    notifyListeners();

    console.log('[SyncService] Sync completed successfully');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sync failed';
    syncState = {
      ...syncState,
      status: 'error',
      error: message,
    };
    notifyListeners();

    console.error('[SyncService] Sync failed:', error);
    return { success: false, error: message };
  }
}

/**
 * Sync objectives with the backend
 */
async function syncObjectives(): Promise<void> {
  const localObjectives = useObjectiveStore.getState().objectives;
  const { addObjective, updateObjective } = useObjectiveStore.getState();

  // Get remote objectives
  const { objectives: remoteObjectives } = await api.getObjectives();

  // Create a map of remote objectives by ID
  const remoteMap = new Map(remoteObjectives.map((o) => [o.id, o]));
  const localMap = new Map(localObjectives.map((o) => [o.id, o]));

  // Upload new local objectives (those not in remote)
  for (const local of localObjectives) {
    if (!remoteMap.has(local.id)) {
      console.log(`[SyncService] Uploading new objective: ${local.name}`);
      
      try {
        await api.createObjective({
          name: local.name,
          category: local.category,
          description: local.description,
          targetOutcome: local.targetOutcome,
          endDate: local.timeframe.endDate?.toISOString(),
          dailyCommitmentMinutes: local.timeframe.dailyCommitmentMinutes,
          pillars: local.pillars.map((p) => ({
            name: p.name,
            description: p.description,
            weight: p.weight,
            progress: p.progress,
          })),
          metrics: local.metrics.map((m) => ({
            name: m.name,
            unit: m.unit,
            type: m.type,
            target: m.target,
            targetDirection: m.targetDirection,
            current: m.current,
            source: m.source,
            pillarId: m.pillarId,
          })),
          rituals: local.rituals.map((r) => ({
            name: r.name,
            description: r.description,
            frequency: r.frequency,
            daysOfWeek: r.daysOfWeek,
            timesPerPeriod: r.timesPerPeriod,
            estimatedMinutes: r.estimatedMinutes,
            pillarId: r.pillarId,
          })),
        });
      } catch (error) {
        console.error(`[SyncService] Failed to upload objective ${local.name}:`, error);
      }
    }
  }

  // Download remote objectives not in local
  for (const remote of remoteObjectives) {
    if (!localMap.has(remote.id)) {
      console.log(`[SyncService] Downloading objective: ${remote.name}`);
      
      // Get full objective with pillars, metrics, rituals
      const { objective: fullObjective } = await api.getObjective(remote.id);
      
      const localObjective: Objective = {
        id: fullObjective.id,
        name: fullObjective.name,
        category: fullObjective.category as Objective['category'],
        description: fullObjective.description || '',
        targetOutcome: fullObjective.targetOutcome || '',
        pillars: (fullObjective.pillars || []).map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          weight: p.weight,
          progress: p.progress,
        })),
        metrics: (fullObjective.metrics || []).map((m) => ({
          id: m.id,
          name: m.name,
          unit: m.unit,
          type: m.type as any,
          target: m.target,
          targetDirection: m.targetDirection as any,
          current: m.current,
          history: [],
          source: m.source as any,
          pillarId: m.pillarId,
        })),
        rituals: (fullObjective.rituals || []).map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          frequency: r.frequency,
          daysOfWeek: r.daysOfWeek,
          timesPerPeriod: r.timesPerPeriod,
          currentStreak: r.currentStreak,
          longestStreak: r.longestStreak,
          completionsThisPeriod: 0,
          completionHistory: [],
          pillarId: r.pillarId,
          estimatedMinutes: r.estimatedMinutes,
        })),
        timeframe: {
          startDate: new Date(fullObjective.startDate),
          endDate: fullObjective.endDate ? new Date(fullObjective.endDate) : undefined,
          dailyCommitmentMinutes: fullObjective.dailyCommitmentMinutes || 60,
        },
        status: fullObjective.status as any,
        priority: fullObjective.priority || 1,
        isPaused: fullObjective.isPaused || false,
        createdAt: new Date(fullObjective.createdAt),
        updatedAt: new Date(fullObjective.updatedAt),
      };
      
      addObjective(localObjective);
    }
  }
}

/**
 * Sync tasks with the backend
 */
async function syncTasks(): Promise<void> {
  const localTasks = useTaskStore.getState().tasks;
  const { addTasks, updateTask } = useTaskStore.getState();

  // Get today's tasks from remote
  const today = new Date().toISOString().split('T')[0];
  const { tasks: remoteTasks } = await api.getTasks(today);

  // Create maps
  const remoteMap = new Map(remoteTasks.map((t) => [t.id, t]));
  const localMap = new Map(localTasks.map((t) => [t.id, t]));

  // Upload new local tasks
  for (const local of localTasks) {
    if (!remoteMap.has(local.id)) {
      console.log(`[SyncService] Uploading new task: ${local.title}`);
      
      try {
        await api.createTask({
          objectiveId: local.objectiveId,
          pillarId: local.pillarId,
          ritualId: local.ritualId,
          title: local.title,
          description: local.description,
          whyItMatters: local.whyItMatters,
          scheduledAt: new Date(local.scheduledAt).toISOString(),
          durationMinutes: local.durationMinutes,
        });
      } catch (error) {
        console.error(`[SyncService] Failed to upload task ${local.title}:`, error);
      }
    }
  }

  // Sync task status changes
  for (const local of localTasks) {
    const remote = remoteMap.get(local.id);
    if (remote && local.status !== remote.status) {
      console.log(`[SyncService] Syncing task status: ${local.title} -> ${local.status}`);
      
      try {
        await api.updateTask(local.id, {
          status: local.status,
          completedAt: local.completedAt?.toISOString(),
          skippedReason: local.skippedReason,
        });
      } catch (error) {
        console.error(`[SyncService] Failed to sync task status ${local.title}:`, error);
      }
    }
  }

  // Download remote tasks not in local
  for (const remote of remoteTasks) {
    if (!localMap.has(remote.id)) {
      console.log(`[SyncService] Downloading task: ${remote.title}`);
      
      const localTask: Task = {
        id: remote.id,
        objectiveId: remote.objectiveId,
        pillarId: remote.pillarId,
        ritualId: remote.ritualId,
        title: remote.title,
        description: remote.description,
        whyItMatters: remote.whyItMatters,
        scheduledAt: new Date(remote.scheduledAt),
        durationMinutes: remote.durationMinutes,
        status: remote.status,
        completedAt: remote.completedAt ? new Date(remote.completedAt) : undefined,
        skippedReason: remote.skippedReason,
      };
      
      addTasks([localTask]);
    }
  }
}

/**
 * Upload a single objective to the backend
 */
export async function uploadObjective(objective: Objective): Promise<void> {
  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) return;

  try {
    await api.createObjective({
      name: objective.name,
      category: objective.category,
      description: objective.description,
      targetOutcome: objective.targetOutcome,
      endDate: objective.timeframe.endDate?.toISOString(),
      dailyCommitmentMinutes: objective.timeframe.dailyCommitmentMinutes,
      pillars: objective.pillars.map((p) => ({
        name: p.name,
        description: p.description,
        weight: p.weight,
        progress: p.progress,
      })),
      metrics: objective.metrics.map((m) => ({
        name: m.name,
        unit: m.unit,
        type: m.type,
        target: m.target,
        targetDirection: m.targetDirection,
        current: m.current,
        source: m.source,
        pillarId: m.pillarId,
      })),
      rituals: objective.rituals.map((r) => ({
        name: r.name,
        description: r.description,
        frequency: r.frequency,
        daysOfWeek: r.daysOfWeek,
        timesPerPeriod: r.timesPerPeriod,
        estimatedMinutes: r.estimatedMinutes,
        pillarId: r.pillarId,
      })),
    });
    console.log(`[SyncService] Uploaded objective: ${objective.name}`);
  } catch (error) {
    console.error(`[SyncService] Failed to upload objective:`, error);
    throw error;
  }
}

/**
 * Upload tasks to the backend
 */
export async function uploadTasks(tasks: Task[]): Promise<void> {
  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) return;

  for (const task of tasks) {
    try {
      await api.createTask({
        objectiveId: task.objectiveId,
        pillarId: task.pillarId,
        ritualId: task.ritualId,
        title: task.title,
        description: task.description,
        whyItMatters: task.whyItMatters,
        scheduledAt: new Date(task.scheduledAt).toISOString(),
        durationMinutes: task.durationMinutes,
      });
    } catch (error) {
      console.error(`[SyncService] Failed to upload task ${task.title}:`, error);
    }
  }
}
