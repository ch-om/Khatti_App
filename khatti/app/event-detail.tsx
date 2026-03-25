import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../supabase';

export default function EventDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);

    // get current user
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    // get event
    const { data: eventData } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();
    setEvent(eventData);

    // get attendees
    const { data: attendeesData } = await supabase
      .from('attendees')
      .select('*')
      .eq('event_id', id);
    setAttendees(attendeesData || []);

    // check if current user already joined
    if (user) {
      const already = attendeesData?.find(a => a.user_id === user.id);
      setIsJoined(!!already);
    }

    setLoading(false);
  }

  // Handle Joining
  async function joinEvent() {
    const { data } = await supabase
      .from('attendees')
      .insert({ event_id: id, user_id: currentUser.id, status: 'going' })
      .select()
      .single();
    setIsJoined(true);
    setAttendees(prev => [...prev, data]);
  }

  // Handle Leaving with Warning
  function promptLeaveEvent() {
    Alert.alert(
      "Leave Event",
      "Are you sure you want to leave this event and its chat room?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Leave", 
          style: "destructive", 
          onPress: async () => {
            await supabase
              .from('attendees')
              .delete()
              .eq('event_id', id)
              .eq('user_id', currentUser.id);
            setIsJoined(false);
            setAttendees(prev => prev.filter(a => a.user_id !== currentUser.id));
          } 
        }
      ]
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Header with Back Button and Top-Right Leave Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          
          {isJoined && (
            <TouchableOpacity onPress={promptLeaveEvent}>
              <Text style={styles.leaveTextTop}>Leave Event</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.category}>{event.category.toUpperCase()}</Text>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.date}>{new Date(event.event_date).toDateString()}</Text>

        {event.description ? (
          <Text style={styles.description}>{event.description}</Text>
        ) : null}

        {event.address ? (
          <Text style={styles.address}>📍 {event.address}</Text>
        ) : null}

        <Text style={styles.attendeeCount}>
          {attendees.length} {attendees.length === 1 ? 'person' : 'people'} going
        </Text>

        {/* Bottom Action Buttons */}
        {!isJoined ? (
          <TouchableOpacity style={styles.joinButton} onPress={joinEvent}>
            <Text style={styles.joinButtonText}>Join Event</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.chatButton} 
            onPress={() => router.push({ pathname: '/chat', params: { id: event.id, title: event.title } } as any)}
          >
            <Text style={styles.chatButtonText}>💬 Open Chat</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 24 },
  
  // Header styles
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  back: { paddingVertical: 4 },
  backText: { fontSize: 16, color: '#f97316', fontWeight: 'bold' },
  leaveTextTop: { fontSize: 14, color: '#ef4444', fontWeight: 'bold' }, // Red color for leaving
  
  category: { fontSize: 12, color: '#f97316', fontWeight: 'bold', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  date: { fontSize: 14, color: '#666', marginBottom: 16 },
  description: { fontSize: 16, color: '#333', marginBottom: 16 },
  address: { fontSize: 14, color: '#666', marginBottom: 16 },
  attendeeCount: { fontSize: 16, fontWeight: 'bold', marginBottom: 24 },
  
  // Button styles
  joinButton: { backgroundColor: '#f97316', padding: 16, borderRadius: 12, alignItems: 'center' },
  joinButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  chatButton: { backgroundColor: '#e8f0fe', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#d2e3fc' },
  chatButtonText: { color: '#1a73e8', fontWeight: 'bold', fontSize: 16 },
});