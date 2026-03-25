import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '../supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUp() {
  setLoading(true);
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: email.split('@')[0], // uses part before @ as name for now
      }
    }
  });
  if (error) setMessage(error.message);
  setLoading(false);
}

  async function signIn() {
    setLoading(true);
    const { data,error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
    }else {
      console.log('TOKEN:', data.session.access_token);
    }
    setLoading(false);
  }


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Khatti 🎉</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={signIn} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Loading...' : 'Login'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button2} onPress={signUp} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Loading...' : 'Sign Up'}</Text>
      </TouchableOpacity>

      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 32 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#f97316', padding: 14, borderRadius: 8, marginBottom: 12 },
  button2: { backgroundColor: '#333', padding: 14, borderRadius: 8, marginBottom: 12 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  message: { textAlign: 'center', marginTop: 16, color: 'red' },
});

