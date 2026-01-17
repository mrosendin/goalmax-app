import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';

export default function ObjectiveScreen() {
  const [objectiveInput, setObjectiveInput] = useState('');
  
  // Mock data - will be replaced with store
  const hasObjective = true;
  const activeObjective = {
    name: 'Career Advancement',
    category: 'career',
    description: 'Advance to senior engineering position within 12 months through skill development, visible contributions, and strategic networking.',
    targetOutcome: 'Promotion to Senior Engineer by December 2026',
    dailyCommitment: 90,
    startDate: new Date('2026-01-01'),
    daysActive: 16,
    completionRate: 87,
  };

  if (!hasObjective) {
    return (
      <SafeAreaView className="flex-1 bg-telofy-bg" edges={['bottom']}>
        <ScrollView className="flex-1 px-5 pt-4">
          {/* Onboarding State */}
          <View className="items-center py-12">
            <View className="w-20 h-20 rounded-full bg-telofy-surface items-center justify-center mb-6">
              <FontAwesome name="crosshairs" size={32} color="#22c55e" />
            </View>
            <Text className="text-telofy-text text-2xl font-bold text-center mb-3">
              Define your objective
            </Text>
            <Text className="text-telofy-text-secondary text-center mb-8 px-4">
              Tell Telofy what you want to achieve. Be specific about outcomes, not activities.
            </Text>
          </View>

          {/* Input Card */}
          <View className="rounded-2xl p-5 bg-telofy-surface border border-telofy-border mb-6">
            <Text className="text-telofy-text-secondary text-sm mb-3 tracking-wide">
              WHAT DO YOU WANT TO ACHIEVE?
            </Text>
            <TextInput
              className="text-telofy-text text-base p-4 rounded-xl bg-telofy-bg border border-telofy-border min-h-[120px]"
              placeholder="e.g., Get promoted to senior engineer within 12 months..."
              placeholderTextColor="#52525b"
              multiline
              textAlignVertical="top"
              value={objectiveInput}
              onChangeText={setObjectiveInput}
            />
            <Text className="text-telofy-text-secondary text-xs mt-3">
              Telofy will analyze your input and create a structured execution plan.
            </Text>
          </View>

          {/* Example Objectives */}
          <Text className="text-telofy-text-secondary text-sm mb-4 tracking-wide">
            EXAMPLES
          </Text>
          {[
            { icon: 'heartbeat', label: 'Lose 20 lbs in 4 months through consistent workouts' },
            { icon: 'briefcase', label: 'Launch side project and get first 100 users' },
            { icon: 'graduation-cap', label: 'Pass AWS certification exam by March' },
          ].map((example, i) => (
            <Pressable 
              key={i}
              className="flex-row items-center p-4 rounded-xl bg-telofy-surface border border-telofy-border mb-3 active:opacity-80"
              onPress={() => setObjectiveInput(example.label)}
            >
              <FontAwesome name={example.icon as any} size={18} color="#52525b" />
              <Text className="flex-1 ml-4 text-telofy-text-secondary">
                {example.label}
              </Text>
            </Pressable>
          ))}

          {/* Submit Button */}
          <Pressable 
            className={`rounded-xl py-4 items-center mt-6 ${objectiveInput.length > 10 ? 'bg-telofy-accent' : 'bg-telofy-muted'}`}
            disabled={objectiveInput.length <= 10}
          >
            <Text className={`font-semibold ${objectiveInput.length > 10 ? 'text-telofy-bg' : 'text-telofy-text-secondary'}`}>
              Create Objective
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-telofy-bg" edges={['bottom']}>
      <ScrollView className="flex-1 px-5 pt-4">
        {/* Objective Header */}
        <View className="rounded-2xl p-6 bg-telofy-surface border border-telofy-border mb-6">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-full bg-telofy-accent/20 items-center justify-center">
              <FontAwesome name="briefcase" size={18} color="#22c55e" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-telofy-text-secondary text-xs tracking-wide">
                {activeObjective.category.toUpperCase()}
              </Text>
              <Text className="text-telofy-text text-xl font-bold">
                {activeObjective.name}
              </Text>
            </View>
            <Pressable className="p-2">
              <FontAwesome name="ellipsis-h" size={18} color="#52525b" />
            </Pressable>
          </View>
          
          <Text className="text-telofy-text-secondary text-base mb-4 leading-6">
            {activeObjective.description}
          </Text>

          <View className="bg-telofy-bg rounded-xl p-4">
            <Text className="text-telofy-text-secondary text-xs mb-1 tracking-wide">
              TARGET OUTCOME
            </Text>
            <Text className="text-telofy-text font-medium">
              {activeObjective.targetOutcome}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 rounded-xl p-4 bg-telofy-surface border border-telofy-border">
            <Text className="text-telofy-accent text-2xl font-bold">
              {activeObjective.daysActive}
            </Text>
            <Text className="text-telofy-text-secondary text-sm">Days active</Text>
          </View>
          <View className="flex-1 rounded-xl p-4 bg-telofy-surface border border-telofy-border">
            <Text className="text-telofy-text text-2xl font-bold">
              {activeObjective.completionRate}%
            </Text>
            <Text className="text-telofy-text-secondary text-sm">Completion rate</Text>
          </View>
          <View className="flex-1 rounded-xl p-4 bg-telofy-surface border border-telofy-border">
            <Text className="text-telofy-text text-2xl font-bold">
              {activeObjective.dailyCommitment}m
            </Text>
            <Text className="text-telofy-text-secondary text-sm">Daily time</Text>
          </View>
        </View>

        {/* Execution Status */}
        <View className="rounded-2xl p-6 bg-telofy-surface border border-telofy-border mb-6">
          <Text className="text-telofy-text-secondary text-sm mb-4 tracking-wide">
            EXECUTION STATUS
          </Text>
          
          <View className="flex-row items-center mb-4">
            <View className="w-3 h-3 rounded-full bg-telofy-accent mr-3" />
            <Text className="text-telofy-text font-medium">Objective aligned</Text>
          </View>

          <Text className="text-telofy-text-secondary text-sm leading-5">
            Current trajectory supports target outcome. Maintain daily execution rate for optimal results.
          </Text>
        </View>

        {/* Weekly Focus */}
        <View className="rounded-2xl p-6 bg-telofy-surface border border-telofy-border mb-8">
          <Text className="text-telofy-text-secondary text-sm mb-4 tracking-wide">
            THIS WEEK'S FOCUS
          </Text>
          
          {[
            'Complete 3 visible code contributions',
            'Schedule 1:1 with engineering manager',
            'Document architecture decisions',
          ].map((item, i) => (
            <View key={i} className="flex-row items-start mb-3">
              <FontAwesome name="check" size={14} color="#22c55e" style={{ marginTop: 3 }} />
              <Text className="text-telofy-text ml-3 flex-1">{item}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
