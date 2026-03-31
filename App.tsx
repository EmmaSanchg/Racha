import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { buildHeatmap, computeActiveStreak, computeBestStreak, toDateKey } from './src/streaks';
import type { Habit } from './src/types';

const STORAGE_KEY = 'racha.habits.v1';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldShowAlert: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const DEFAULT_COLOR = '#10B981';
const DEFAULT_ICON = '🔥';

const parseTime = (value: string): { hour: number; minute: number } | null => {
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (Number.isNaN(hour) || Number.isNaN(minute) || hour > 23 || minute > 59) return null;
  return { hour, minute };
};

const scheduleReminder = async (habit: Habit): Promise<string | undefined> => {
  const parsed = parseTime(habit.reminderTime);
  if (!parsed) return undefined;

  const existingStatus = await Notifications.getPermissionsAsync();
  const status =
    existingStatus.granted || existingStatus.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
      ? existingStatus
      : await Notifications.requestPermissionsAsync();

  if (!status.granted && status.ios?.status !== Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return undefined;
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: `Recordatorio: ${habit.name}`,
      body: `No rompas tu racha de ${habit.name}.`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: parsed.hour,
      minute: parsed.minute,
    },
  });
};

const App = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [icon, setIcon] = useState(DEFAULT_ICON);

  useEffect(() => {
    const load = async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Habit[];
      setHabits(parsed);
      if (parsed.length) setSelectedId(parsed[0].id);
    };

    load().catch(() => Alert.alert('Error', 'No se pudieron cargar los hábitos.'));
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(habits)).catch(() => undefined);
  }, [habits]);

  const selectedHabit = useMemo(() => habits.find((h) => h.id === selectedId) ?? null, [habits, selectedId]);

  const addHabit = () => {
    if (!name.trim()) {
      Alert.alert('Nombre requerido', 'Escribe un nombre para el hábito.');
      return;
    }

    const next: Habit = {
      id: `${Date.now()}`,
      name: name.trim(),
      color: color || DEFAULT_COLOR,
      icon: icon || DEFAULT_ICON,
      reminderEnabled: false,
      reminderTime: '20:00',
      completions: [],
    };

    setHabits((prev) => [next, ...prev]);
    setSelectedId(next.id);
    setName('');
    setColor(DEFAULT_COLOR);
    setIcon(DEFAULT_ICON);
  };

  const markToday = (habitId: string) => {
    const today = toDateKey(new Date());

    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId) return habit;
        const exists = habit.completions.includes(today);
        return {
          ...habit,
          completions: exists
            ? habit.completions.filter((d) => d !== today)
            : [...habit.completions, today],
        };
      }),
    );
  };

  const updateReminder = async (habit: Habit, enabled: boolean, reminderTime?: string) => {
    const nextTime = reminderTime ?? habit.reminderTime;

    if (habit.notificationId) {
      await Notifications.cancelScheduledNotificationAsync(habit.notificationId).catch(() => undefined);
    }

    let notificationId: string | undefined;

    if (enabled) {
      notificationId = await scheduleReminder({ ...habit, reminderTime: nextTime, reminderEnabled: true });
      if (!notificationId) {
        Alert.alert('Permiso requerido', 'Activa permisos de notificaciones para usar recordatorios.');
      }
    }

    setHabits((prev) =>
      prev.map((current) =>
        current.id === habit.id
          ? {
              ...current,
              reminderEnabled: Boolean(notificationId),
              reminderTime: nextTime,
              notificationId,
            }
          : current,
      ),
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ExpoStatusBar style="dark" />
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Racha</Text>
        <Text style={styles.subtitle}>Construye hábitos diarios y supera tu mejor marca.</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Nuevo hábito</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Nombre (ej. Leer)" style={styles.input} />
          <TextInput value={color} onChangeText={setColor} placeholder="#10B981" style={styles.input} />
          <TextInput value={icon} onChangeText={setIcon} placeholder="📚" style={styles.input} maxLength={2} />
          <Pressable onPress={addHabit} style={styles.button}>
            <Text style={styles.buttonText}>Agregar hábito</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tus hábitos</Text>
          {habits.length === 0 ? <Text style={styles.empty}>Aún no tienes hábitos creados.</Text> : null}
          <FlatList
            data={habits}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const active = computeActiveStreak(item.completions);
              const best = computeBestStreak(item.completions);
              const doneToday = item.completions.includes(toDateKey(new Date()));

              return (
                <Pressable
                  style={[styles.habitRow, selectedId === item.id && styles.habitRowActive]}
                  onPress={() => setSelectedId(item.id)}
                >
                  <Text style={styles.habitName}>{item.icon} {item.name}</Text>
                  <Text style={styles.metrics}>Racha: {active} · Mejor: {best}</Text>
                  <Pressable
                    onPress={() => markToday(item.id)}
                    style={[styles.smallButton, { backgroundColor: doneToday ? item.color : '#E5E7EB' }]}
                  >
                    <Text style={[styles.smallButtonText, { color: doneToday ? '#fff' : '#111827' }]}>
                      {doneToday ? 'Completado' : 'Marcar hoy'}
                    </Text>
                  </Pressable>
                </Pressable>
              );
            }}
          />
        </View>

        {selectedHabit ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Detalle: {selectedHabit.icon} {selectedHabit.name}</Text>
            <Text style={styles.metrics}>Racha activa: {computeActiveStreak(selectedHabit.completions)} días</Text>
            <Text style={styles.metrics}>Mejor racha: {computeBestStreak(selectedHabit.completions)} días</Text>

            <View style={styles.reminderRow}>
              <Text style={styles.label}>Recordatorio diario</Text>
              <Switch
                value={selectedHabit.reminderEnabled}
                onValueChange={(value) => updateReminder(selectedHabit, value)}
              />
            </View>

            <TextInput
              value={selectedHabit.reminderTime}
              onChangeText={(value) => {
                setHabits((prev) =>
                  prev.map((h) =>
                    h.id === selectedHabit.id
                      ? {
                          ...h,
                          reminderTime: value,
                        }
                      : h,
                  ),
                );
              }}
              onEndEditing={() => {
                const refreshed = habits.find((h) => h.id === selectedHabit.id);
                if (!refreshed) return;
                if (!parseTime(refreshed.reminderTime)) {
                  Alert.alert('Hora inválida', 'Usa formato HH:MM (24h), por ejemplo 07:30.');
                  return;
                }
                if (refreshed.reminderEnabled) {
                  updateReminder(refreshed, true, refreshed.reminderTime).catch(() => undefined);
                }
              }}
              placeholder="Hora recordatorio (HH:MM)"
              style={styles.input}
            />

            <Text style={styles.label}>Cumplimiento (últimos 84 días)</Text>
            <View style={styles.grid}>
              {buildHeatmap(selectedHabit.completions).map((cell) => (
                <View
                  key={cell.date}
                  style={[
                    styles.cell,
                    {
                      backgroundColor: cell.done ? selectedHabit.color : '#E5E7EB',
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Vista para Widget (lista resumida)</Text>
          {habits.map((habit) => (
            <View key={`widget-${habit.id}`} style={styles.widgetRow}>
              <Text style={styles.habitName}>{habit.icon} {habit.name}</Text>
              <Text style={styles.metrics}>{computeActiveStreak(habit.completions)} días</Text>
            </View>
          ))}
          <Text style={styles.note}>
            Nota: los widgets Android reales requieren Expo Dev Build (no están soportados en Expo Go puro).
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { padding: 16, gap: 14, paddingBottom: 60 },
  title: { fontSize: 36, fontWeight: '800', color: '#111827' },
  subtitle: { color: '#4B5563', marginBottom: 8 },
  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sectionTitle: { fontWeight: '700', fontSize: 18, color: '#111827' },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  button: { backgroundColor: '#111827', borderRadius: 10, padding: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
  empty: { color: '#6B7280' },
  habitRow: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 10, gap: 6, marginBottom: 8 },
  habitRowActive: { borderColor: '#111827' },
  habitName: { fontWeight: '700', fontSize: 16, color: '#111827' },
  metrics: { color: '#374151' },
  smallButton: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  smallButtonText: { fontWeight: '700' },
  reminderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontWeight: '600', color: '#111827' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  cell: { width: 14, height: 14, borderRadius: 3 },
  widgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 6,
  },
  note: { color: '#6B7280', fontSize: 12 },
});

export default App;
