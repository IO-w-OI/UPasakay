import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Header with Logo (from your assets) */}
      <View style={styles.header}>
        <Text style={styles.title}>UPasakay</Text>
      </View>

      {/* 2. Login Form */}
      <View style={styles.form}>
        <TextInput placeholder="UP Mail (@up.edu.ph)" style={styles.input} />
        <TextInput placeholder="Password" secureTextEntry style={styles.input} />
        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffff', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#7B1113', textAlign: 'center' },
  input: { borderBottomWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 10 },
  button: { backgroundColor: '#7B1113', padding: 15, borderRadius: 8, marginTop: 20 },
  buttonText: { color: '#FFB61C', textAlign: 'center', fontWeight: 'bold' },
});