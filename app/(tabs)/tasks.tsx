import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { format } from 'date-fns';

interface TaskItemProps {
  title: string;
  time: string;
  duration: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
}

function TaskItem({ title, time, duration, status }: TaskItemProps) {
  const statusStyles = {
    pending: {
      border: 'border-telofy-border',
      icon: 'circle-o' as const,
      iconColor: '#52525b',
    },
    in_progress: {
      border: 'border-telofy-accent',
      icon: 'play-circle' as const,
      iconColor: '#22c55e',
    },
    completed: {
      border: 'border-telofy-accent',
      icon: 'check-circle' as const,
      iconColor: '#22c55e',
    },
    skipped: {
      border: 'border-telofy-muted',
      icon: 'minus-circle' as const,
      iconColor: '#52525b',
    },
  };

  const style = statusStyles[status];

  return (
    <Pressable 
      className={`flex-row items-center p-4 rounded-xl bg-telofy-surface border ${style.border} mb-3 active:opacity-80`}
    >
      <FontAwesome name={style.icon} size={24} color={style.iconColor} />
      <View className="flex-1 ml-4">
        <Text 
          className={`text-base font-medium ${status === 'completed' || status === 'skipped' ? 'text-telofy-muted line-through' : 'text-telofy-text'}`}
        >
          {title}
        </Text>
        <Text className="text-telofy-text-secondary text-sm mt-1">
          {time} • {duration}
        </Text>
      </View>
      <FontAwesome name="chevron-right" size={14} color="#52525b" />
    </Pressable>
  );
}

export default function TasksScreen() {
  const today = new Date();
  
  // Mock tasks - will be replaced with store data
  const tasks = [
    { id: '1', title: 'Morning workout routine', time: '06:30', duration: '45 min', status: 'completed' as const },
    { id: '2', title: 'Review project proposals', time: '09:00', duration: '1 hr', status: 'completed' as const },
    { id: '3', title: 'Team standup meeting', time: '10:00', duration: '30 min', status: 'completed' as const },
    { id: '4', title: 'Deep work: Feature development', time: '11:00', duration: '2 hr', status: 'in_progress' as const },
    { id: '5', title: 'Review quarterly objectives', time: '14:00', duration: '30 min', status: 'pending' as const },
    { id: '6', title: 'Email catchup', time: '15:00', duration: '30 min', status: 'pending' as const },
    { id: '7', title: 'Evening reading session', time: '20:00', duration: '30 min', status: 'pending' as const },
  ];

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const inProgressTask = tasks.find(t => t.status === 'in_progress');

  return (
    <SafeAreaView className="flex-1 bg-telofy-bg" edges={['bottom']}>
      <ScrollView className="flex-1 px-5 pt-4">
        {/* Date Header */}
        <View className="mb-6">
          <Text className="text-telofy-text-secondary text-sm tracking-wide">
            {format(today, 'EEEE').toUpperCase()}
          </Text>
          <Text className="text-telofy-text text-2xl font-bold">
            {format(today, 'MMMM d, yyyy')}
          </Text>
        </View>

        {/* Progress Summary */}
        <View className="flex-row items-center justify-between mb-6 p-4 rounded-xl bg-telofy-surface border border-telofy-border">
          <View>
            <Text className="text-telofy-text font-semibold text-lg">
              {completedCount}/{tasks.length} completed
            </Text>
            <Text className="text-telofy-text-secondary text-sm">
              {tasks.length - completedCount} remaining today
            </Text>
          </View>
          <View className="w-16 h-16 rounded-full border-4 border-telofy-accent/30 items-center justify-center">
            <Text className="text-telofy-accent font-bold">
              {Math.round((completedCount / tasks.length) * 100)}%
            </Text>
          </View>
        </View>

        {/* Current Task Highlight */}
        {inProgressTask && (
          <View className="mb-6">
            <Text className="text-telofy-text-secondary text-sm mb-3 tracking-wide">
              IN PROGRESS
            </Text>
            <View className="p-5 rounded-xl bg-telofy-accent/10 border border-telofy-accent">
              <Text className="text-telofy-text text-lg font-semibold mb-1">
                {inProgressTask.title}
              </Text>
              <Text className="text-telofy-text-secondary text-sm mb-4">
                {inProgressTask.time} • {inProgressTask.duration}
              </Text>
              <View className="flex-row gap-3">
                <Pressable className="flex-1 bg-telofy-accent rounded-xl py-3 items-center active:opacity-80">
                  <Text className="text-telofy-bg font-semibold">Complete</Text>
                </Pressable>
                <Pressable className="flex-1 bg-telofy-surface rounded-xl py-3 items-center border border-telofy-border active:opacity-80">
                  <Text className="text-telofy-text font-semibold">Skip</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Task List */}
        <Text className="text-telofy-text-secondary text-sm mb-3 tracking-wide">
          ALL TASKS
        </Text>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            title={task.title}
            time={task.time}
            duration={task.duration}
            status={task.status}
          />
        ))}

        {/* Spacer for bottom */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
