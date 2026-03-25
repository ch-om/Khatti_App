import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../supabase';

export default function ChatScreen() {
  const { id, title } = useLocalSearchParams();
  const router = useRouter();

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [customUser, setCustomUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`chat_${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `event_id=eq.${id}` },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  async function loadInitialData() {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    if (user) {
      const { data: cUser } = await supabase.from('users').select('*').eq('id', user.id).single();
      setCustomUser(cUser);
    }

    const { data: pastMessages } = await supabase
      .from('messages')
      .select('*')
      .eq('event_id', id)
      .order('created_at', { ascending: true });
    
    setMessages(pastMessages || []);
    setLoading(false);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 200);
  }

  async function sendMessage() {
    const text = inputText.trim();
    if (!text || !currentUser) return;
    
    setInputText('');

    await supabase.from('messages').insert({
      event_id: id,
      user_id: currentUser.id,
      sender_name: customUser?.name || 'User',
      content: text,
    });
  }

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
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
      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
        >
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title} Chat</Text>
          <View style={styles.spacer} />
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            const isMe = item.user_id === currentUser?.id;
            return (
              <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
                {!isMe && <Text style={styles.msgSender}>{item.sender_name}</Text>}
                <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                  <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{item.content}</Text>
                </View>
                <Text style={[styles.msgTime, isMe && styles.msgTimeMe]}>{formatTime(item.created_at)}</Text>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyChat}>No messages yet. Be the first to say hello!</Text>}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#888"
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Text style={styles.sendBtnText}>↑</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  keyboardContainer: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  backBtn: { paddingVertical: 4 },
  backText: { fontSize: 16, color: '#f97316', fontWeight: 'bold' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  spacer: { width: 50 },
  messageList: { padding: 16, paddingBottom: 32 },
  emptyChat: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 16 },
  msgRow: { marginBottom: 16, alignItems: 'flex-start', maxWidth: '80%' },
  msgRowMe: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  msgSender: { fontSize: 12, color: '#888', marginBottom: 4, marginLeft: 4 },
  bubble: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  bubbleMe: { backgroundColor: '#f97316', borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: '#f2f2f2', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 16, color: '#111', lineHeight: 22 },
  bubbleTextMe: { color: '#fff' },
  msgTime: { fontSize: 10, color: '#aaa', marginTop: 4, paddingHorizontal: 4 },
  msgTimeMe: { textAlign: 'right' },
  inputRow: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#eee', alignItems: 'center', backgroundColor: '#fff' },
  textInput: { flex: 1, backgroundColor: '#f2f2f2', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, marginRight: 12, maxHeight: 100 },
  sendBtn: { backgroundColor: '#f97316', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  sendBtnText: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 2 }
});