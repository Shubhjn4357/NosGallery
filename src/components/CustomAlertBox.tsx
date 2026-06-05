import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import * as LucideIcons from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CustomAlertBoxProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isWarning?: boolean;
}

export const CustomAlertBox: React.FC<CustomAlertBoxProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isWarning = false,
}) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.alertCard}>
          {/* Header Warning Icon */}
          <View style={[styles.iconContainer, { backgroundColor: isWarning ? 'rgba(255, 59, 48, 0.12)' : 'rgba(0, 122, 255, 0.12)' }]}>
            {isWarning ? (
              <LucideIcons.AlertTriangle size={20} color="#7C9EFF" />
            ) : (
              <LucideIcons.HelpCircle size={20} color="#007aff" />
            )}
          </View>

          {/* Title and Message */}
          <Text style={styles.alertTitle}>{title.toUpperCase()}</Text>
          <Text style={styles.alertMessage}>{message}</Text>

          {/* Actions Row */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onCancel}
              style={[styles.btn, styles.cancelBtn]}
            >
              <Text style={styles.cancelBtnText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onConfirm}
              style={[styles.btn, isWarning ? styles.warningBtn : styles.confirmBtn]}
            >
              <Text style={styles.confirmBtnText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertCard: {
    width: SCREEN_WIDTH * 0.82,
    backgroundColor: '#0a0a0b',
    borderWidth: 1,
    borderColor: '#1a1a1c',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  alertTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 8,
  },
  alertMessage: {
    color: '#8e8e93',
    fontSize: 11.5,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#161618',
    borderWidth: 1,
    borderColor: '#242426',
  },
  cancelBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  confirmBtn: {
    backgroundColor: '#ffffff',
  },
  warningBtn: {
    backgroundColor: '#7C9EFF',
  },
  confirmBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
  },
});
