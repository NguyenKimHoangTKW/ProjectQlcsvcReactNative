import React, { useState, useEffect } from 'react';
import { View, Button, Alert, Image, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '../apiConfig';
import { LinearGradient } from 'react-native-linear-gradient';
import { Surface } from 'react-native-paper';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

GoogleSignin.configure({
  webClientId: '604677039958-sa0rj3uckcg90pek12do54kl4v1m7ai6.apps.googleusercontent.com',
});

async function onGoogleButtonPress(navigation: any) {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    const currentUser = await GoogleSignin.getCurrentUser();
    if (!currentUser || !currentUser.idToken) {
      throw new Error('Không nhận được idToken từ Google');
    }
    
    const googleCredential = auth.GoogleAuthProvider.credential(currentUser.idToken);
    const userCredential = await auth().signInWithCredential(googleCredential);
    if (userCredential.user.email) {
      getUserInfo(userCredential.user.email, navigation);
    }
    return userCredential;
}
async function getUserInfo(email: string, navigation: any) {
  const response = await fetch(`${API_URL}/login-with-google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-From-Mobile': 'true',
    },
    body: JSON.stringify({ email: email }),
  });
  const res = await response.json();
  if (res.success) {
    await AsyncStorage.setItem('userInfo', JSON.stringify(res));
    if(res.idRole === 1){
      navigation.navigate('ListDevices');
    }else if(res.idRole === 3){
      navigation.navigate('BorrowerListManagement');
    }
    else if(res.idRole === 2){
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Thông báo quan trọng',
        text2: "Đây là tài khoản Admin, vui lòng truy cập vào trang web để quản lý hệ thống",
        visibilityTime: 5000,
        autoHide: true,
        topOffset: 60,
      });
      console.log("Đây là tài khoản Admin, vui lòng truy cập vào trang web để quản lý");
      
      try {
        await GoogleSignin.signOut();
        await auth().signOut();
      } catch (error) {
        console.log('Error signing out:', error);
      }
    }
  }
  else{
    Toast.show({
      type: 'error',
      position: 'top',
      text1: 'Lỗi đăng nhập',
      text2: res.message,
      visibilityTime: 5000,
      autoHide: true,
      topOffset: 60,
    });
    
    try {
      await GoogleSignin.signOut();
      await auth().signOut();
    } catch (error) {
      console.log('Error signing out:', error);
    }
  }
}
export default function GoogleSignInScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    const checkSignInState = async () => {
      try {
        const currentUser = await GoogleSignin.getCurrentUser();
        if (currentUser) {
          await GoogleSignin.signOut();
        }
      } catch (error) {
        console.log('No user signed in or error checking state:', error);
      }
    };
    
    checkSignInState();
  }, []);
  
  return (
    <View style={styles.container}>
      <View style={styles.container}>
          <LinearGradient
            colors={['#1976D2', '#64B5F6', '#42A5F5']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.overlay}>
              <Surface style={styles.card}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>TRƯỜNG ĐẠI HỌC</Text>
                  <Text style={styles.title}>THỦ DẦU MỘT</Text>
                  <Text style={styles.subtitle}>THU DAU MOT UNIVERSITY</Text>
                </View>
                <Image source={require('../assets/images/logo.jpg')} style={styles.logo} />
                <View style={styles.divider} />
        
                <View style={styles.contentContainer}>
                  <Text style={styles.subheader}>HỆ THỐNG QUẢN LÝ CƠ SỞ VẬT CHẤT</Text>
                  <Text style={styles.subtext}>
                    Ban Kế hoạch và cơ sở vật chất, kỹ thuật	
                  </Text>
        
                  <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Đăng nhập với tài khoản TDMU</Text>
                    <TouchableOpacity 
                        style={styles.customGoogleButton}
                        onPress={() => onGoogleButtonPress(navigation)}>
                        <Text style={styles.customGoogleButtonText}>Đăng nhập với Google</Text>
                      </TouchableOpacity>
                  </View>
                </View>
              </Surface>
            </View>
          </LinearGradient>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    gradient: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    fallbackGradient: {
      flex: 1,
      width: '100%',
      height: '100%',
      backgroundColor: '#42A5F5',
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    card: {
      width: width * 0.9,
      maxWidth: 400,
      padding: 30,
      borderRadius: 15,
      alignItems: 'center',
      elevation: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
    },
    logo: {
      width: width * 0.25,
      height: width * 0.25,
      maxWidth: 120,
      maxHeight: 120,
      marginBottom: 20,
    },
    titleContainer: {
      alignItems: 'center',
      marginBottom: 15,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#1565C0',
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: '#1976D2',
      marginTop: 5,
    },
    divider: {
      width: '80%',
      height: 2,
      backgroundColor: '#2196F3',
      marginVertical: 15,
      opacity: 0.5,
    },
    contentContainer: {
      width: '100%',
      alignItems: 'center',
    },
    subheader: {
      color: '#0D47A1',
      fontWeight: 'bold',
      fontSize: 16,
      textAlign: 'center',
      marginTop: 10,
    },
    subtext: {
      color: '#1976D2',
      fontSize: 14,
      textAlign: 'center',
      marginTop: 5,
      marginBottom: 25,
    },
    loginContainer: {
      alignItems: 'center',
      marginTop: 10,
    },
    loginText: {
      fontSize: 16,
      color: '#1565C0',
      marginBottom: 15,
      fontWeight: '500',
    },
    googleButton: {
      width: 240,
      height: 48,
    },
    loading: {
      marginTop: 10,
    },
    customGoogleButton: {
      width: 240,
      height: 48,
      backgroundColor: '#4285F4',
      borderRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      paddingHorizontal: 12,
    },
    customGoogleButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    errorText: {
      color: 'red',
      marginBottom: 10,
      textAlign: 'center',
    }
  });