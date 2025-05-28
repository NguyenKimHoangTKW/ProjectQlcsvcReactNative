import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import { Alert } from "react-native";
import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";


export const API_URL = 'https://kimhoang.site/api/v1';

export const handleLogout = async (navigation: any, setIsLoggingOut: any) => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await GoogleSignin.signOut();
              await auth().signOut();
              navigation.dispatch(CommonActions.reset({
                index: 0,
                routes: [{ name: 'GoogleSignInScreen' }],
              }));
              AsyncStorage.removeItem('userInfo')
              clearSession();
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  async function clearSession(){
    const res = await fetch(`${API_URL}/clear_session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await res.json();
  }


  export async function getUserInfo(setUserInfo: any) {
    try {
      const userInfoStr = await AsyncStorage.getItem('userInfo');
      if (userInfoStr) {
        const parsedUserInfo = JSON.parse(userInfoStr);
        setUserInfo(parsedUserInfo);
      }
    } catch (error) {
      console.error('Error getting user info:', error);
    }
  }
