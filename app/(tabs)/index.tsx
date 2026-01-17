import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function StatusScreen() {
  // Mock data - will be replaced with store data
  const currentStatus = 'on_track';
  const completedToday = 3;
  const totalToday = 5;
  const activeObjective = 'Career Advancement';

  const statusConfig = {
    on_track: {
      label: 'ON TRACK',
      color: 'text-telofy-accent',
      bgColor: 'bg-telofy-accent/10',
      icon: 'check-circle' as const,
    },
    deviation_detected: {
      label: 'DEVIATION DETECTED',
      color: 'text-telofy-error',
      bgColor: 'bg-telofy-error/10',
      icon: 'exclamation-circle' as const,
    },
    recalibrating: {
      label: 'RECALIBRATING',
      color: 'text-telofy-warning',
      bgColor: 'bg-telofy-warning/10',
      icon: 'refresh' as const,
    },
    paused: {
      label: 'PAUSED',
      color: 'text-telofy-muted',
      bgColor: 'bg-telofy-muted/10',
      icon: 'pause-circle' as const,
    },
  };

  const status = statusConfig[currentStatus];
  const completionPercent = Math.round((completedToday / totalToday) * 100);

  return (
    <SafeAreaView className="flex-1 bg-telofy-bg" edges={['bottom']}>
      <ScrollView className="flex-1 px-5 pt-4">
        {/* Status Card */}
        <View className={`rounded-2xl p-6 ${status.bgColor} border border-telofy-border mb-6`}>
          <View className="flex-row items-center mb-4">
            <FontAwesome name={status.icon} size={20} color={status.color === 'text-telofy-accent' ? '#22c55e' : status.color === 'text-telofy-error' ? '#ef4444' : '#f59e0b'} />
            <Text className={`ml-3 text-sm font-semibold tracking-wider ${status.color}`}>
              {status.label}
            </Text>
          </View>
          <Text className="text-telofy-text text-2xl font-bold mb-1">
            {activeObjective}
          </Text>
          <Text className="text-telofy-text-secondary text-sm">
            Active objective
          </Text>
        </View>

        {/* Progress Card */}
        <View className="rounded-2xl p-6 bg-telofy-surface border border-telofy-border mb-6">
          <Text className="text-telofy-text-secondary text-sm mb-4 tracking-wide">
            TODAY'S EXECUTION
          </Text>
          
          {/* Progress Ring - simplified */}
          <View className="items-center mb-6">
            <View className="w-32 h-32 rounded-full border-4 border-telofy-border items-center justify-center">
              <Text className="text-telofy-text text-4xl font-bold">
                {completionPercent}%
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <Text className="text-telofy-accent text-2xl font-bold">{completedToday}</Text>
              <Text className="text-telofy-text-secondary text-sm">Completed</Text>
            </View>
            <View className="w-px bg-telofy-border" />
            <View className="items-center flex-1">
              <Text className="text-telofy-text text-2xl font-bold">{totalToday - completedToday}</Text>
              <Text className="text-telofy-text-secondary text-sm">Remaining</Text>
            </View>
            <View className="w-px bg-telofy-border" />
            <View className="items-center flex-1">
              <Text className="text-telofy-text text-2xl font-bold">{totalToday}</Text>
              <Text className="text-telofy-text-secondary text-sm">Total</Text>
            </View>
          </View>
        </View>

        {/* Next Task Card */}
        <View className="rounded-2xl p-6 bg-telofy-surface border border-telofy-border mb-6">
          <Text className="text-telofy-text-secondary text-sm mb-3 tracking-wide">
            NEXT SCHEDULED
          </Text>
          <Text className="text-telofy-text text-lg font-semibold mb-2">
            Review quarterly objectives
          </Text>
          <Text className="text-telofy-text-secondary text-sm mb-4">
            14:00 – 14:30 • 30 min
          </Text>
          <Pressable className="bg-telofy-accent rounded-xl py-3 px-6 items-center active:opacity-80">
            <Text className="text-telofy-bg font-semibold">Start Now</Text>
          </Pressable>
        </View>

        {/* Quick Stats */}
        <View className="rounded-2xl p-6 bg-telofy-surface border border-telofy-border mb-8">
          <Text className="text-telofy-text-secondary text-sm mb-4 tracking-wide">
            THIS WEEK
          </Text>
          <View className="flex-row justify-between">
            <View>
              <Text className="text-telofy-text text-lg font-semibold">87%</Text>
              <Text className="text-telofy-text-secondary text-sm">Completion</Text>
            </View>
            <View>
              <Text className="text-telofy-text text-lg font-semibold">2</Text>
              <Text className="text-telofy-text-secondary text-sm">Deviations</Text>
            </View>
            <View>
              <Text className="text-telofy-text text-lg font-semibold">5 days</Text>
              <Text className="text-telofy-text-secondary text-sm">Streak</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
