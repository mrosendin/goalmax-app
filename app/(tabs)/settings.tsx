import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';

interface SettingRowProps {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  value?: string;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  onPress?: () => void;
}

function SettingRow({ 
  icon, 
  label, 
  value, 
  hasSwitch, 
  switchValue, 
  onSwitchChange,
  onPress 
}: SettingRowProps) {
  return (
    <Pressable 
      className="flex-row items-center py-4 border-b border-telofy-border active:opacity-80"
      onPress={onPress}
      disabled={hasSwitch}
    >
      <View className="w-9 h-9 rounded-lg bg-telofy-bg items-center justify-center">
        <FontAwesome name={icon} size={16} color="#52525b" />
      </View>
      <Text className="flex-1 ml-4 text-telofy-text text-base">{label}</Text>
      {hasSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#27272a', true: '#22c55e' }}
          thumbColor="#fafafa"
        />
      ) : value ? (
        <Text className="text-telofy-text-secondary mr-2">{value}</Text>
      ) : null}
      {!hasSwitch && (
        <FontAwesome name="chevron-right" size={14} color="#52525b" />
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [escalation, setEscalation] = useState(true);
  const [quietHours, setQuietHours] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-telofy-bg" edges={['bottom']}>
      <ScrollView className="flex-1 px-5 pt-4">
        {/* Profile Section */}
        <View className="items-center py-6 mb-4">
          <View className="w-20 h-20 rounded-full bg-telofy-surface items-center justify-center mb-4">
            <FontAwesome name="user" size={32} color="#52525b" />
          </View>
          <Text className="text-telofy-text text-lg font-semibold">Telofy User</Text>
          <Text className="text-telofy-text-secondary text-sm">Free Plan</Text>
        </View>

        {/* Notifications */}
        <View className="rounded-2xl bg-telofy-surface border border-telofy-border mb-6 px-4">
          <Text className="text-telofy-text-secondary text-xs py-4 tracking-wide">
            NOTIFICATIONS
          </Text>
          <SettingRow
            icon="bell"
            label="Push Notifications"
            hasSwitch
            switchValue={notifications}
            onSwitchChange={setNotifications}
          />
          <SettingRow
            icon="exclamation-triangle"
            label="Escalation Reminders"
            hasSwitch
            switchValue={escalation}
            onSwitchChange={setEscalation}
          />
          <SettingRow
            icon="moon-o"
            label="Quiet Hours"
            hasSwitch
            switchValue={quietHours}
            onSwitchChange={setQuietHours}
          />
          <SettingRow
            icon="clock-o"
            label="Advance Notice"
            value="5 min"
          />
        </View>

        {/* Schedule */}
        <View className="rounded-2xl bg-telofy-surface border border-telofy-border mb-6 px-4">
          <Text className="text-telofy-text-secondary text-xs py-4 tracking-wide">
            SCHEDULE
          </Text>
          <SettingRow
            icon="calendar"
            label="Time Blocks"
          />
          <SettingRow
            icon="globe"
            label="Timezone"
            value="America/New_York"
          />
        </View>

        {/* AI Settings */}
        <View className="rounded-2xl bg-telofy-surface border border-telofy-border mb-6 px-4">
          <Text className="text-telofy-text-secondary text-xs py-4 tracking-wide">
            AI SETTINGS
          </Text>
          <SettingRow
            icon="sliders"
            label="Response Style"
            value="Direct"
          />
          <SettingRow
            icon="refresh"
            label="Auto-Recalibrate"
            value="On"
          />
        </View>

        {/* Data & Privacy */}
        <View className="rounded-2xl bg-telofy-surface border border-telofy-border mb-6 px-4">
          <Text className="text-telofy-text-secondary text-xs py-4 tracking-wide">
            DATA & PRIVACY
          </Text>
          <SettingRow
            icon="download"
            label="Export Data"
          />
          <SettingRow
            icon="trash"
            label="Clear All Data"
          />
        </View>

        {/* About */}
        <View className="rounded-2xl bg-telofy-surface border border-telofy-border mb-8 px-4">
          <Text className="text-telofy-text-secondary text-xs py-4 tracking-wide">
            ABOUT
          </Text>
          <SettingRow
            icon="info-circle"
            label="Version"
            value="1.0.0"
          />
          <SettingRow
            icon="file-text-o"
            label="Terms of Service"
          />
          <SettingRow
            icon="shield"
            label="Privacy Policy"
          />
        </View>

        {/* Footer */}
        <View className="items-center pb-8">
          <Text className="text-telofy-muted text-sm font-semibold">TELOFY</Text>
          <Text className="text-telofy-muted text-xs mt-1">
            Turn intention into execution.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
