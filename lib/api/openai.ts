/**
 * OpenAI API client for Telofy AI features
 */

import OpenAI from 'openai';
import type { Objective, Task, AIContext, AITaskPlan } from '../types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

// System prompt for Telofy's AI personality
const SYSTEM_PROMPT = `You are Telofy, an AI execution system focused on turning user intentions into completed outcomes. Your role is to:

1. Break down user objectives into actionable, time-bound tasks
2. Create realistic schedules based on available time blocks
3. Detect deviations from the plan and suggest corrections
4. Maintain accountability without being aggressive or condescending

Communication style:
- Be direct and status-oriented
- Use language like "on track", "deviation detected", "recalibrating"
- Avoid cheerleading, motivational clichés, or excessive encouragement
- Be helpful and supportive, but not a "buddy app"

You are a system that ensures execution, not a coach that motivates.`;

/**
 * Generate a task plan for an objective
 */
export async function generateTaskPlan(
  objective: Objective,
  availableTimeBlocks: { start: string; end: string }[],
  existingTasks: Task[] = []
): Promise<AITaskPlan> {
  const prompt = `
Objective: ${objective.name}
Category: ${objective.category}
Description: ${objective.description}
Target Outcome: ${objective.targetOutcome}
Daily Commitment: ${objective.timeframe.dailyCommitmentMinutes} minutes
Timeframe: ${objective.timeframe.startDate.toISOString().split('T')[0]} to ${objective.timeframe.endDate?.toISOString().split('T')[0] ?? 'ongoing'}

Available time blocks today:
${availableTimeBlocks.map((b) => `- ${b.start} to ${b.end}`).join('\n')}

Existing scheduled tasks:
${existingTasks.length > 0 ? existingTasks.map((t) => `- ${t.title} at ${new Date(t.scheduledAt).toLocaleTimeString()}`).join('\n') : 'None'}

Generate a practical task plan for today that:
1. Fits within the available time blocks
2. Doesn't overlap with existing tasks
3. Totals approximately ${objective.timeframe.dailyCommitmentMinutes} minutes
4. Includes specific, actionable tasks (not vague goals)

Respond in JSON format:
{
  "tasks": [
    {
      "objectiveId": "${objective.id}",
      "title": "Task name",
      "description": "Brief description",
      "scheduledAt": "ISO timestamp",
      "durationMinutes": number
    }
  ],
  "reasoning": "Brief explanation of the plan",
  "adjustments": "Any notes about adjustments made"
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from AI');
  }

  return JSON.parse(content) as AITaskPlan;
}

/**
 * Analyze a deviation and suggest a course correction
 */
export async function analyzeDeviation(
  context: AIContext,
  deviationType: 'missed' | 'delayed' | 'partial' | 'cancelled'
): Promise<string> {
  const prompt = `
A deviation has been detected in the user's execution.

Objective: ${context.objective.name}
Deviation type: ${deviationType}

Recent task history:
${context.recentTasks.map((t) => `- ${t.title}: ${t.status}`).join('\n')}

Recent deviations:
${context.recentDeviations.map((d) => `- ${d.type} at ${new Date(d.detectedAt).toLocaleTimeString()}`).join('\n')}

${context.userFeedback ? `User feedback: ${context.userFeedback}` : ''}

Provide a brief, actionable response:
1. Acknowledge the deviation (without judgment)
2. Suggest a specific adjustment
3. Keep the user on track toward their objective

Be direct but not harsh. Sound like a system reporting status and suggesting next steps.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 200,
  });

  return response.choices[0]?.message?.content ?? 'Unable to analyze deviation.';
}

/**
 * Generate a daily status summary
 */
export async function generateDailySummary(
  objective: Objective,
  completedTasks: Task[],
  skippedTasks: Task[],
  deviations: number
): Promise<string> {
  const completionRate = completedTasks.length / (completedTasks.length + skippedTasks.length);
  
  const prompt = `
Generate a brief end-of-day status report.

Objective: ${objective.name}
Completed tasks: ${completedTasks.length}
Skipped tasks: ${skippedTasks.length}
Completion rate: ${(completionRate * 100).toFixed(0)}%
Deviations today: ${deviations}

Completed:
${completedTasks.map((t) => `- ${t.title}`).join('\n') || 'None'}

Skipped:
${skippedTasks.map((t) => `- ${t.title}${t.skippedReason ? ` (${t.skippedReason})` : ''}`).join('\n') || 'None'}

Write 2-3 sentences summarizing the day. Be factual, note progress, and if needed, briefly mention what should be prioritized tomorrow. Sound like a system report, not a coach.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 150,
  });

  return response.choices[0]?.message?.content ?? 'Daily summary unavailable.';
}

/**
 * Process natural language objective input
 */
export async function parseObjectiveInput(userInput: string): Promise<{
  name: string;
  category: string;
  description: string;
  targetOutcome: string;
  suggestedDailyMinutes: number;
}> {
  const prompt = `
Parse the following user input into a structured objective:

"${userInput}"

Extract:
1. A clear, concise name for the objective
2. Category (one of: fitness, career, academic, health, financial, creative, custom)
3. A description expanding on what the user wants to achieve
4. A measurable target outcome
5. A suggested daily time commitment in minutes (be realistic)

Respond in JSON format:
{
  "name": "Objective name",
  "category": "category",
  "description": "Expanded description",
  "targetOutcome": "Specific measurable outcome",
  "suggestedDailyMinutes": number
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from AI');
  }

  return JSON.parse(content);
}
