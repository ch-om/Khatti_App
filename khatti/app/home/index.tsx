import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../supabase';

export default function Home() {
  const [location, setLocation] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function getLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const last = await Location.getLastKnownPositionAsync({});
      if (last) setLocation(last.coords);

      const current = await Location.getCurrentPositionAsync({});
      setLocation(current.coords);
    }
    getLocation();
  }, []);

  useFocusEffect(
    useCallback(() => {
      async function getEvents() {
        const { data, error } = await supabase
          .from('events')
          .select('*');
        if (error) console.log(error);
        else setEvents(data);
      }
      getEvents();
    }, [])
  );

  async function logout() {
    await supabase.auth.signOut();
  }

  function handleMapPress(e: any) {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    router.push({
      pathname: '/create-event',
      params: { lat: latitude, lng: longitude },
    } as any);
  }

  if (!location) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        style={styles.map}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onLongPress={handleMapPress}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {events.map((event) => (
          <Marker
            key={event.id}
            coordinate={{
              latitude: event.lat,
              longitude: event.lng,
            }}
            title={event.title}
            description={event.description}
            pinColor="#f97316"
            onPress={() => router.push({
              pathname: '/event-detail',
              params: { id: event.id },
            } as any)}
          />
        ))}
      </MapView>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoutButton: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: { color: '#fff', fontWeight: 'bold' },
});