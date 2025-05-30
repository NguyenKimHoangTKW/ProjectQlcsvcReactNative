import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_URL, getUserInfo } from '../apiConfig';

interface BorrowedItem {
  id_danh_sach_muon: number;
  name_CBVC: string;
  ten_phong_hoc: string;
  ten_thiet_bi: string;
  so_luong_muon: number;
  yeu_cau: string;
  ten_trang_thaii: string;
  ly_do_huy: string | null;
  ngay_dang_ky_muon: number;
  ngay_huy: number | null;
  ngay_muon: number | null;
  ngay_tra: number | null;
}

export default function BorrowedEquipmentUser() {
  const navigation = useNavigation();
  const [borrowedItems, setBorrowedItems] = useState<BorrowedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BorrowedItem | null>(null);

  async function getBorrowedItems() {
    try {
      if (!userInfo?.email) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
        return;
      }

      const response = await fetch(`${API_URL}/get-full-thiet-bi-muon-by-cbvc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userInfo.email
        }),
      });
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setBorrowedItems(data);
      } else {
        console.log('API response is not an array:', data);
        setBorrowedItems([]);
      }
    } catch (error) {
      console.error('Error fetching borrowed items:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách thiết bị đã mượn');
      setBorrowedItems([]); 
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getUserInfo(setUserInfo);
  }, []);

  useEffect(() => {
    if (userInfo?.email) {
      getBorrowedItems();
    }
  }, [userInfo]);

  const formatDate = (timestamp: number) => {
    try {
      if (!timestamp || timestamp <= 0) {
        return 'Chưa có thông tin';
      }
      const date = new Date(timestamp * 1000);
      if (isNaN(date.getTime())) {
        return 'Ngày không hợp lệ';
      }
      return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Lỗi hiển thị ngày';
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const getStatusColor = (status: string) => {
    if (!status) return '#666';
    
    switch (status) {
      case 'Đang chờ duyệt':
        return '#ff9800';
      case 'Đã duyệt':
        return '#4caf50';
      case 'Đã trả':
        return '#2196f3';
      case 'Đã hủy':
        return '#f44336';
      case 'Từ chối':
        return '#f44336';
      case 'Không xác định':
        return '#666';
      default:
        return '#666';
    }
  };

  const handleCancel = (item: BorrowedItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const confirmCancel = async () => {
    if (!selectedItem) return;
    const response = await fetch(`${API_URL}/user-huy-muon-thiet-bi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_danh_sach_muon: selectedItem.id_danh_sach_muon,
        ly_do_huy: selectedItem.ly_do_huy || 'Người dùng hủy'
      }),
    });
    const data = await response.json();
    
    if (data.success) {
      Alert.alert('Thành công', data.message);
      getBorrowedItems();
    } else {
      Alert.alert('Lỗi', data.message || 'Không thể hủy thiết bị mượn');
    }

    setModalVisible(false);
    setSelectedItem(null);
  };

  const canCancelItem = (status: string) => {
    return status === 'Đang chờ duyệt';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>DANH SÁCH THIẾT BỊ ĐÃ MƯỢN</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải danh sách thiết bị...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>DANH SÁCH THIẾT BỊ ĐÃ MƯỢN</Text>
        </View>

        {/* Back Button */}
        <View style={styles.backButtonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>

        {/* Borrowed Items List */}
        <View style={styles.contentContainer}>
          {borrowedItems && borrowedItems.length > 0 ? (
            borrowedItems.map((item) => (
              <View key={item.id_danh_sach_muon} style={styles.itemCard}>
                <View style={styles.itemInfo}>
                  <Text style={styles.infoLabel}>Tên thiết bị mượn: 
                    <Text style={styles.infoValue}> {item.ten_thiet_bi || 'Chưa có thông tin'}</Text>
                  </Text>
                  
                  <Text style={styles.infoLabel}>Phòng học mượn: 
                    <Text style={styles.infoValue}> {item.ten_phong_hoc || 'Chưa có thông tin'}</Text>
                  </Text>
                  
                  <Text style={styles.infoLabel}>Số lượng mượn: 
                    <Text style={styles.infoValue}> {item.so_luong_muon || 0}</Text>
                  </Text>
                  
                  <Text style={styles.infoLabel}>Yêu cầu từ bạn: 
                    <Text style={styles.infoValue}> {item.yeu_cau || 'Không có'}</Text>
                  </Text>
                  
                  <Text style={styles.infoLabel}>Ngày đăng ký mượn: 
                    <Text style={styles.infoValue}> {item.ngay_dang_ky_muon ? formatDate(item.ngay_dang_ky_muon) : 'Chưa có thông tin'}</Text>
                  </Text>

                  {item.ngay_muon && (
                    <Text style={styles.infoLabel}>Ngày mượn: 
                      <Text style={styles.infoValue}> {formatDate(item.ngay_muon)}</Text>
                    </Text>
                  )}

                  {item.ngay_tra && (
                    <Text style={styles.infoLabel}>Ngày trả: 
                      <Text style={styles.infoValue}> {formatDate(item.ngay_tra)}</Text>
                    </Text>
                  )}

                  {item.ngay_huy && (
                    <Text style={styles.infoLabel}>Ngày hủy: 
                      <Text style={styles.infoValue}> {formatDate(item.ngay_huy)}</Text>
                    </Text>
                  )}

                  {item.ly_do_huy && (
                    <Text style={styles.infoLabel}>Lý do/Ghi chú: 
                      <Text style={styles.infoValue}> {item.ly_do_huy}</Text>
                    </Text>
                  )}
                </View>

                {/* Status Button */}
                <View style={styles.statusContainer}>
                  <TouchableOpacity 
                    style={[styles.statusButton, { backgroundColor: getStatusColor(item.ten_trang_thaii || 'Không xác định') }]}
                  >
                    <Text style={styles.statusButtonText}>{item.ten_trang_thaii || 'Không xác định'}</Text>
                  </TouchableOpacity>
                </View>

                {/* Cancel Button */}
                <View style={styles.cancelButtonContainer}>
                  {canCancelItem(item.ten_trang_thaii || 'Không xác định') && (
                    <TouchableOpacity 
                      style={styles.cancelButton}
                      onPress={() => handleCancel(item)}
                    >
                      <Text style={styles.cancelButtonText}>Hủy</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Chưa có thiết bị nào được mượn</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nhập lý do hủy</Text>
            <TextInput
              style={styles.input}
              placeholder="Lý do hủy"
              value={selectedItem?.ly_do_huy || ''}
              onChangeText={(text) => {
                if (selectedItem) {
                  setSelectedItem({ ...selectedItem, ly_do_huy: text });
                }
              }}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={confirmCancel}
              >
                <Text style={styles.buttonText}>Đồng ý</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#42a5f5',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButtonContainer: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemInfo: {
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    lineHeight: 24,
  },
  infoValue: {
    fontWeight: 'bold',
    color: '#333',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  statusButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  cancelButtonContainer: {
    alignItems: 'flex-end',
  },
  cancelButton: {
    padding: 10,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmButton: {
    backgroundColor: '#4caf50',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
