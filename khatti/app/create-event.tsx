import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../supabase';

export default function CreateEvent() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function createEvent() {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase.from('events').insert({
      title,
      description,
      category,
      address,
      lat: parseFloat(params.lat as string),
      lng: parseFloat(params.lng as string),
      host_id: userData.user?.id,
      event_date: new Date().toISOString(),
    });

    if (error) {
      setMessage(error.message);
    } else {
      router.back();
    }
    setLoading(false);
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Event 📍</Text>

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="eg. Pottery Workshop"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        placeholder="What is this event about?"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Category</Text>
      <TextInput
        style={styles.input}
        placeholder="eg. pottery, anime, business"
        value={category}
        onChangeText={setCategory}
      />

      <Text style={styles.label}>Address</Text>
      <TextInput
        style={styles.input}
        placeholder="eg. MG Road, Bhubaneswar"
        value={address}
        onChangeText={setAddress}
      />

      {message ? <Text style={styles.error}>{message}</Text> : null}

      <TouchableOpacity
        style={styles.button}
        onPress={createEvent}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating...' : 'Create Event'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  label: { fontSize: 14, color: '#666', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#f97316', padding: 14, borderRadius: 8, marginBottom: 32 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  error: { color: 'red', marginBottom: 12 },
});