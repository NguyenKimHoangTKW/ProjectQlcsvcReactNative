import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { CommonActions } from '@react-navigation/native';
import { API_URL, getUserInfo, handleLogout } from '../../apiConfig';
import LinearGradient from 'react-native-linear-gradient';

interface BorrowRequest {
  id_danh_sach_muon: number;
  name_CBVC: string;
  ten_phong_hoc: string;
  ten_thiet_bi: string;
  so_luong_muon: number;
  yeu_cau: string;
  ly_do_huy: string | null;
  ten_trang_thaii: string;
  ngay_dang_ky_muon: number;
  ngay_huy: number | null;
  ngay_muon: number | null;
  ngay_tra: number | null;
}

interface ApprovalStatus {
  ten_trang_thaii: string;
}

export default function BorrowerListManagement() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loading, setLoading] = useState(true);
  const [borrowRequests, setBorrowRequests] = useState<BorrowRequest[]>([]);
  const [approvalStatuses, setApprovalStatuses] = useState<ApprovalStatus[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<BorrowRequest | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const [userInfo, setUserInfo] = useState<any>(null);

  const filteredRequests = selectedFilter === 'all'
    ? borrowRequests
    : borrowRequests.filter(request => request.ten_trang_thaii === selectedFilter);

  const statusOptions = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Đang chờ duyệt', value: 'Đang chờ duyệt' },
    { label: 'Đã duyệt', value: 'Đã duyệt' },
    { label: 'Đã trả', value: 'Đã trả' },
    { label: 'Đã hủy', value: 'Đã hủy' },
    { label: 'Từ chối', value: 'Từ chối' }
  ];

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

  async function GetBorrowRequest() {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/get-full-thiet-bi-muon`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setBorrowRequests(data);
      } else {
        console.log('API response is not an array:', data);
        setBorrowRequests([]);
      }
    } catch (error) {
      console.error('Error fetching borrow requests:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách thiết bị mượn');
      setBorrowRequests([]);
    } finally {
      setLoading(false);
    }
  }

  async function SelectedTrangThai() {
    try {
      const response = await fetch(`${API_URL}/droplist_trang_thai_duyet_muon`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setApprovalStatuses(data);
      }
    } catch (error) {
      console.error('Error fetching approval statuses:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách trạng thái');
    }
  }

  const handleRequestPress = (request: BorrowRequest) => {
    setSelectedRequest(request);
    setSelectedStatus('');
    setRejectReason('');
    setModalVisible(true);
    SelectedTrangThai();
  };

  async function handleApprove() {
    if (!selectedStatus) {
      Alert.alert('Lỗi', 'Vui lòng chọn trạng thái');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/duyet-muon-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_danh_sach_muon: selectedRequest?.id_danh_sach_muon,
          ten_thiet_bi: selectedRequest?.ten_thiet_bi,
          ten_trang_thai: selectedStatus,
          ly_do_huy: rejectReason || null
        })
      });

      const result = await response.json();
      if (result.success) {
        Alert.alert('Thành công', 'Cập nhật trạng thái thành công');
        setModalVisible(false);
        GetBorrowRequest();
      } else {
        Alert.alert('Lỗi', result.message || 'Không thể cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Lỗi', 'Đã có lỗi xảy ra khi cập nhật trạng thái');
    }
  }

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedRequest(null);
    setSelectedStatus('');
    setRejectReason('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đang chờ duyệt':
        return '#ff9800';
      case 'Đã duyệt':
        return '#2196f3';
      case 'Đã trả':
        return '#4caf50';
      case 'Đã hủy':
        return '#f44336';
      case 'Từ chối':
        return '#f44336';
      default:
        return '#666';
    }
  };

  useEffect(() => {
    getUserInfo(setUserInfo);
    GetBorrowRequest();
  }, []);
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
                  <Text style={styles.greeting}>{userInfo?.name}</Text>
                  <Text style={styles.email}>{userInfo?.email}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        <Text style={styles.title}>DANH SÁCH THIẾT BỊ NGƯỜI DÙNG ĐĂNG KÝ MƯỢN</Text>

        <View style={styles.logoutContainer}>
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

        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Lọc theo trạng thái</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedFilter}
              style={styles.picker}
              onValueChange={(itemValue: string) => setSelectedFilter(itemValue)}
            >
              {statusOptions.map((option) => (
                <Picker.Item 
                  key={option.value} 
                  label={`${option.label} (${option.value === 'all' 
                    ? borrowRequests.length
                    : borrowRequests.filter(r => r.ten_trang_thaii === option.value).length})`} 
                  value={option.value} 
                />
              ))}
            </Picker>
          </View>
          {selectedFilter !== 'all' && (
            <Text style={styles.filterInfo}>
              Đang hiển thị {filteredRequests.length} yêu cầu có trạng thái "{selectedFilter}"
            </Text>
          )}
        </View>
        <View style={styles.requestsList}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Đang tải danh sách thiết bị mượn...</Text>
            </View>
          ) : filteredRequests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {selectedFilter === 'all' 
                  ? 'Không có yêu cầu mượn thiết bị nào'
                  : `Không có yêu cầu mượn thiết bị nào có trạng thái "${selectedFilter}"`
                }
              </Text>
            </View>
          ) : (
            filteredRequests.map((request) => (
              <TouchableOpacity
                key={request.id_danh_sach_muon}
                style={styles.requestCard}
                onPress={() => handleRequestPress(request)}
              >
                <View style={styles.requestHeader}>
                  <Text style={styles.borrowerName}>Tên CBVC/GV mượn:
                    <Text style={styles.borrowerValue}> {request.name_CBVC}</Text>
                  </Text>
                </View>

                <View style={styles.requestDetails}>
                  <Text style={styles.detailText}>Tên thiết bị mượn:
                    <Text style={styles.detailValue}> {request.ten_thiet_bi}</Text>
                  </Text>

                  <Text style={styles.detailText}>Phòng học mượn:
                    <Text style={styles.detailValue}> {request.ten_phong_hoc}</Text>
                  </Text>

                  <Text style={styles.detailText}>Số lượng mượn:
                    <Text style={styles.detailValue}> {request.so_luong_muon}</Text>
                  </Text>

                  {request.yeu_cau && (
                    <>
                      <Text style={styles.detailText}>Yêu cầu của người mượn:</Text>
                      <Text style={styles.requestText}>{request.yeu_cau}</Text>
                    </>
                  )}

                  {request.ly_do_huy && (
                    <>
                      <Text style={styles.detailText}>Lý do hủy:</Text>
                      <Text style={styles.requestText}>{request.ly_do_huy}</Text>
                    </>
                  )}

                  <Text style={styles.detailText}>Ngày đăng ký mượn:
                    <Text style={styles.detailValue}> {formatDate(request.ngay_dang_ky_muon)}</Text>
                  </Text>

                  {request.ngay_muon && (
                    <Text style={styles.detailText}>Ngày duyệt mượn:
                      <Text style={styles.detailValue}> {formatDate(request.ngay_muon)}</Text>
                    </Text>
                  )}

                  {request.ngay_tra && (
                    <Text style={styles.detailText}>Ngày trả:
                      <Text style={styles.detailValue}> {formatDate(request.ngay_tra)}</Text>
                    </Text>
                  )}

                  {request.ngay_huy && (
                    <Text style={styles.detailText}>Ngày hủy:
                      <Text style={styles.detailValue}> {formatDate(request.ngay_huy)}</Text>
                    </Text>
                  )}
                </View>

                {/* Status */}
                <View style={styles.statusContainer}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.ten_trang_thaii) }]}>
                    <Text style={styles.statusText}>{request.ten_trang_thaii}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Duyệt yêu cầu mượn thiết bị</Text>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedRequest && (
                <>
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Thông tin yêu cầu</Text>
                    <Text style={styles.modalLabel}>Người mượn:</Text>
                    <Text style={styles.modalValue}>{selectedRequest.name_CBVC}</Text>
                    
                    <Text style={styles.modalLabel}>Thiết bị:</Text>
                    <Text style={styles.modalValue}>{selectedRequest.ten_thiet_bi}</Text>
                    
                    <Text style={styles.modalLabel}>Phòng học:</Text>
                    <Text style={styles.modalValue}>{selectedRequest.ten_phong_hoc}</Text>
                    
                    <Text style={styles.modalLabel}>Số lượng:</Text>
                    <Text style={styles.modalValue}>{selectedRequest.so_luong_muon}</Text>
                    
                    {selectedRequest.yeu_cau && (
                      <>
                        <Text style={styles.modalLabel}>Yêu cầu:</Text>
                        <Text style={styles.modalValue}>{selectedRequest.yeu_cau}</Text>
                      </>
                    )}
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>Cập nhật trạng thái</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={selectedStatus}
                        style={styles.picker}
                        onValueChange={(itemValue: string) => setSelectedStatus(itemValue)}
                      >
                        <Picker.Item label="Chọn trạng thái" value="" />
                        {approvalStatuses.map((status) => (
                          <Picker.Item
                            key={status.ten_trang_thaii}
                            label={status.ten_trang_thaii}
                            value={status.ten_trang_thaii}
                          />
                        ))}
                      </Picker>
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.modalLabel}>
                        {selectedStatus === 'Đã hủy' ? 'Lý do hủy:' : 'Ghi chú:'}
                      </Text>
                      <TextInput
                        style={styles.textInput}
                        value={rejectReason}
                        onChangeText={setRejectReason}
                        placeholder={selectedStatus === 'Đã hủy'
                          ? "Nhập lý do hủy yêu cầu mượn..."
                          : "Nhập ghi chú cho yêu cầu mượn (nếu có)..."}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                      />
                    </View>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.approveButton]}
                onPress={handleApprove}
              >
                <Text style={styles.buttonText}>Xác nhận</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCloseModal}
              >
                <Text style={styles.buttonText}>Hủy</Text>
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
    elevation: 2,
  },
  logoutContainer: {
    paddingHorizontal: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
  },
  logoutButtonDisabled: {
    backgroundColor: '#ccc',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterContainer: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    padding: 15,
  },
  filterLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontWeight: '500',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    backgroundColor: 'transparent',
  },
  requestsList: {
    paddingHorizontal: 15,
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  requestHeader: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  borrowerName: {
    fontSize: 14,
    color: '#666',
  },
  borrowerValue: {
    fontWeight: 'bold',
    color: '#333',
  },
  requestDetails: {
    padding: 15,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  detailValue: {
    fontWeight: 'bold',
    color: '#333',
  },
  requestText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  statusContainer: {
    padding: 15,
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cancelButtonContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  cancelDeviceButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelDeviceButtonText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  filterInfo: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    backgroundColor: '#42a5f5',
    padding: 15,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginBottom: 10,
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalBody: {
    padding: 15,
    paddingBottom: 80,
  },
  modalSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  modalValue: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  inputContainer: {
    marginTop: 15,
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    fontSize: 14,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  approveButton: {
    backgroundColor: '#4caf50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
