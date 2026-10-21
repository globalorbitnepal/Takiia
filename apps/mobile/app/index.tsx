import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import type { HealthResponse } from '@takiia/shared';

const apiUrl =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ??
  'http://localhost:4000';

export default function HomeScreen() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkApi = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/health`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = (await response.json()) as HealthResponse;
      setHealth(data);
    } catch (err) {
      setHealth(null);
      setError(err instanceof Error ? err.message : 'Request failed');
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Takiia</Text>
      <Text style={styles.subtitle}>
        Android starter (Expo). Messaging and calling are not enabled yet.
      </Text>
      <Text style={styles.meta}>API: {apiUrl}</Text>
      <Pressable style={styles.button} onPress={checkApi}>
        <Text style={styles.buttonText}>Check API health</Text>
      </Pressable>
      {health ? (
        <Text style={styles.result} accessibilityRole="text">
          {health.service}: {health.status} @ {health.timestamp}
        </Text>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#e8eef5',
  },
  subtitle: {
    color: '#8b9aab',
    lineHeight: 22,
  },
  meta: {
    fontFamily: 'monospace',
    color: '#8b9aab',
    fontSize: 12,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#3d8bfd',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  result: {
    color: '#c8d6e5',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  error: {
    color: '#ff7b7b',
  },
});
