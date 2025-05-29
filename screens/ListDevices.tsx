import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { CommonActions } from '@react-navigation/native';
import { API_URL, getUserInfo } from '../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleLogout } from '../apiConfig';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import LinearGradient from 'react-native-linear-gradient';

interface Device {
  id_thiet_bi: number;
  ten_thiet_bi: string;
  thong_so: string;
  ten_thuong_hieu: string;
  so_luong: number;
  mo_ta: string | null;
  ten_phan_loai: string;
  ten_trang_thaii: string;
  ten_don_vi_tinh: string;
}

interface Classroom {
  id_phong_hoc: number;
  ten_phong_hoc: string;
}

export default function ListDevices() {
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [borrowQuantity, setBorrowQuantity] = useState('');
  const [borrowNote, setBorrowNote] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const navigation = useNavigation();
  const [fullPhanLoai, setFullPhanLoai] = useState<any>([]);

  // Filter and pagination logic
  const filteredDevices = selectedGroup === 'all'
    ? devices
    : devices.filter(device => device.ten_phan_loai === selectedGroup);

  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDevices = filteredDevices.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGroup]);


  async function getFullPhanLoai() {
    const response = await fetch(`${API_URL}/droplist-phan-loai`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const res = await response.json();
    setFullPhanLoai(res);
  }
  async function getDevice() {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/get_full_thiet_bi`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const res = await response.json();
      setDevices(res);
    } catch (error) {
      console.error('Error fetching devices:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách thiết bị. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  async function LoadSelectedClass() {
    try {
      const response = await fetch(`${API_URL}/get_full_phong_hoc`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const res = await response.json();
      setClassrooms(res);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách phòng học. Vui lòng thử lại.');
    }
  }

  useEffect(() => {
    getUserInfo(setUserInfo);
    getDevice();
    getFullPhanLoai();
  }, []);

  const handleDevicePress = (device: any) => {
    setSelectedDevice(device);
    setModalVisible(true);
    setBorrowQuantity('');
    setBorrowNote('');
    LoadSelectedClass();
  };

  async function handleRegisterBorrow() {
    try {
      const response = await fetch(`${API_URL}/user_muon_thiet_bi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userInfo.email,
          ten_thiet_bi: selectedDevice?.ten_thiet_bi,
          ten_phong_hoc: selectedClassroomId,
          so_luong_muon: borrowQuantity,
          yeu_cau: borrowNote
        })
      });
      const res = await response.json();
      if (res.success) {
        Toast.show({
          type: 'success',
          position: 'top',
          text1: 'Thành công',
          text2: res.message,
          visibilityTime: 5000,
          autoHide: true,
          topOffset: 60,
        });
        setModalVisible(false);
        getDevice();
      } else {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Lỗi',
          text2: res.message,
          visibilityTime: 5000,
          autoHide: true,
          topOffset: 60,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Lỗi',
        text2: 'Có lỗi xảy ra, vui lòng thử lại',
        visibilityTime: 5000,
        autoHide: true,
        topOffset: 60,
      });
    }
  }
  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleViewBorrowedDevices = () => {
    navigation.navigate('BorrowedEquipmentUser' as never);
  };



  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={['#1976D2', '#64B5F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerGradient}
          >
            <View style={styles.userInfo}>
              <View style={styles.userInfoContent}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : '?'}
                  </Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.greeting}>
                    {userInfo?.name}
                  </Text>
                  <Text style={styles.email}>
                    {userInfo?.email}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Title */}
        <Text style={styles.title}>DANH SÁCH THIẾT BỊ MƯỢN MƯỢN</Text>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.viewButton} onPress={handleViewBorrowedDevices}>
            <Text style={styles.viewButtonText}>Xem thiết bị đã đăng ký mượn</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
            onPress={() => handleLogout(navigation, setIsLoggingOut)}
            disabled={isLoggingOut}
          >
            <Text style={styles.logoutButtonText}>
              {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter Section */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Lọc theo phân loại thiết bị</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedGroup}
              style={styles.picker}
              onValueChange={(itemValue: string) => setSelectedGroup(itemValue)}
            >
              <Picker.Item label="Tất cả" value="all" />
              {fullPhanLoai.map((phanLoai: any) => (
                <Picker.Item key={phanLoai.ten_phan_loai} label={phanLoai.ten_phan_loai} value={phanLoai.ten_phan_loai} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Device List */}
        <View style={styles.deviceList}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Đang tải danh sách thiết bị...</Text>
            </View>
          ) : filteredDevices.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {selectedGroup === 'all'
                  ? 'Không có thiết bị nào'
                  : `Không có thiết bị loại "${selectedGroup}"`
                }
              </Text>
            </View>
          ) : (
            currentDevices.map((device) => (
              <TouchableOpacity
                key={device.id_thiet_bi}
                style={styles.deviceCard}
                onPress={() => handleDevicePress(device)}
              >
                <View style={styles.deviceHeader}>
                  <Text style={styles.deviceName}>Tên thiết bị</Text>
                  <Text style={styles.deviceValue}>{device.ten_thiet_bi}</Text>
                </View>

                <View style={styles.deviceDetails}>
                  <View style={styles.deviceRow}>
                    <Text style={styles.detailLabel}>Thông số:</Text>
                    <Text style={styles.detailValue}>{device.thong_so}</Text>
                  </View>

                  <View style={styles.deviceRow}>
                    <Text style={styles.detailLabel}>Thương hiệu:</Text>
                    <Text style={styles.detailValue}>{device.ten_thuong_hieu}</Text>
                  </View>

                  <View style={styles.deviceRow}>
                    <Text style={styles.detailLabel}>Số lượng còn:</Text>
                    <Text style={styles.detailValue}>{device.so_luong}</Text>
                  </View>

                  <View style={styles.deviceRow}>
                    <Text style={styles.detailLabel}>Loại:</Text>
                    <Text style={styles.detailValue}>{device.ten_phan_loai}</Text>
                  </View>

                  <View style={styles.deviceRow}>
                    <Text style={styles.detailLabel}>Đơn vị tính:</Text>
                    <Text style={styles.detailValue}>{device.ten_don_vi_tinh}</Text>
                  </View>

                  <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Trạng thái:</Text>
                    <Text style={[styles.statusValue, { color: device.ten_trang_thaii === 'Hết' ? '#f44336' : '#4caf50' }]}>
                      {device.ten_trang_thaii}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Pagination Controls */}
        {!loading && filteredDevices.length > 0 && (
          <View style={styles.paginationContainer}>
            <View style={styles.paginationInfo}>
              <Text style={styles.paginationText}>
                Trang {currentPage} / {totalPages} (Hiển thị {currentDevices.length} / {filteredDevices.length} thiết bị)
                {selectedGroup !== 'all' && (
                  <Text style={styles.filterInfo}> - Lọc: {selectedGroup}</Text>
                )}
              </Text>
            </View>

            <View style={styles.paginationControls}>
              <TouchableOpacity
                style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
                onPress={goToPreviousPage}
                disabled={currentPage === 1}
              >
                <Text style={[styles.paginationButtonText, currentPage === 1 && styles.paginationButtonTextDisabled]}>
                  Trước
                </Text>
              </TouchableOpacity>

              <View style={styles.pageNumbers}>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <TouchableOpacity
                    key={page}
                    style={[
                      styles.pageNumberButton,
                      currentPage === page && styles.pageNumberButtonActive
                    ]}
                    onPress={() => goToPage(page)}
                  >
                    <Text style={[
                      styles.pageNumberText,
                      currentPage === page && styles.pageNumberTextActive
                    ]}>
                      {page}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
                onPress={goToNextPage}
                disabled={currentPage === totalPages}
              >
                <Text style={[styles.paginationButtonText, currentPage === totalPages && styles.paginationButtonTextDisabled]}>
                  Sau
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedDevice?.ten_thiet_bi}</Text>
              </View>

              {/* Device Info in Modal */}
              {selectedDevice && (
                <View style={styles.modalDeviceInfo}>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>Danh sách thiết bị thuộc loại này đã vào:</Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>Thông số:</Text>
                    <Text style={styles.modalInfoValue}>{selectedDevice.thong_so}</Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>Thương hiệu:</Text>
                    <Text style={styles.modalInfoValue}>{selectedDevice.ten_thuong_hieu}</Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>Số lượng còn:</Text>
                    <Text style={styles.modalInfoValue}>{selectedDevice.so_luong}</Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>Loại:</Text>
                    <Text style={styles.modalInfoValue}>{selectedDevice.ten_phan_loai}</Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>Đơn vị tính:</Text>
                    <Text style={styles.modalInfoValue}>{selectedDevice.ten_don_vi_tinh}</Text>
                  </View>

                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>Trạng thái:</Text>
                    <Text style={[styles.modalInfoValue, { color: '#4caf50' }]}>{selectedDevice.ten_trang_thaii}</Text>
                  </View>
                </View>
              )}

              {/* Form */}
              <View style={styles.formContainer}>
                <Text style={styles.formLabel}>Phòng học</Text>
                <View style={styles.formPickerContainer}>
                  <Picker
                    selectedValue={selectedClassroomId}
                    style={styles.formPicker}
                    onValueChange={(itemValue: string) => setSelectedClassroomId(itemValue)}
                  >
                    {classrooms.map((classroom) => (
                      <Picker.Item key={classroom.ten_phong_hoc} label={classroom.ten_phong_hoc} value={classroom.ten_phong_hoc} />
                    ))}
                  </Picker>
                </View>

                <Text style={styles.formLabel}>Số lượng mượn</Text>
                <TextInput
                  style={styles.textInput}
                  value={borrowQuantity}
                  onChangeText={setBorrowQuantity}
                  keyboardType="numeric"
                  placeholder="Nhập số lượng"
                />

                <Text style={styles.formLabel}>Yêu cầu (nếu có)</Text>
                <TextInput
                  style={styles.textArea}
                  value={borrowNote}
                  onChangeText={setBorrowNote}
                  multiline={true}
                  numberOfLines={4}
                  placeholder="Nhập yêu cầu..."
                  textAlignVertical="top"
                />
              </View>

              {/* Buttons */}
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity style={styles.registerButton} onPress={handleRegisterBorrow}>
                  <Text style={styles.registerButtonText}>Đăng ký mượn</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCloseModal}>
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3f2fd',
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 20,
  },
  userInfo: {
    paddingHorizontal: 20,
  },
  userInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  greeting: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  title: {
    backgroundColor: '#42a5f5',
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 15,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    gap: 10,
    marginBottom: 20,
  },
  viewButton: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#42a5f5',
  },
  viewButtonText: {
    color: '#42a5f5',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },
  logoutButton: {
    flex: 1,
    backgroundColor: '#f44336',
    paddingVertical: 12,
    borderRadius: 25,
  },
  logoutButtonDisabled: {
    backgroundColor: '#ccc',
  },
  logoutButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },
  filterContainer: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  picker: {
    height: 50,
  },
  deviceList: {
    paddingHorizontal: 15,
  },
  deviceCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  deviceHeader: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  deviceName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  deviceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  deviceDetails: {
    padding: 15,
  },
  deviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: 'bold',
  },
  modalOverlay: {
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
    maxHeight: '80%',
  },
  modalHeader: {
    backgroundColor: '#42a5f5',
    padding: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalDeviceInfo: {
    marginBottom: 20,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  modalInfoLabel: {
    fontSize: 14,
    color: '#666',
  },
  modalInfoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  formContainer: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  formPickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  formPicker: {
    height: 50,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  registerButton: {
    flex: 1,
    backgroundColor: '#4caf50',
    padding: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  registerButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  cancelButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingContainer: {
    padding: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#42a5f5',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  paginationContainer: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 10,
    padding: 15,
  },
  paginationInfo: {
    marginBottom: 10,
  },
  paginationText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  paginationControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  paginationButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#42a5f5',
    borderRadius: 5,
    backgroundColor: 'white',
  },
  paginationButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
  },
  paginationButtonText: {
    color: '#42a5f5',
    fontWeight: 'bold',
    fontSize: 14,
  },
  paginationButtonTextDisabled: {
    color: '#999',
  },
  pageNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pageNumberButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: 'white',
    minWidth: 36,
    alignItems: 'center',
  },
  pageNumberButtonActive: {
    backgroundColor: '#42a5f5',
    borderColor: '#42a5f5',
  },
  pageNumberText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  pageNumberTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  filterInfo: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

