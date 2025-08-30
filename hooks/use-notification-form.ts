import { useState } from 'react';
import { useSendNotification, useBroadcastNotification } from './use-notifications';
import { useDepartments } from './use-departments';
import { useNurses } from '@/features/nurses/api/useNurses';

type NotificationType = 'single' | 'broadcast';

interface NotificationFormValues {
  type: NotificationType;
  userId?: number;
  departmentIds: number[];
  category: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionRequired: boolean;
  actionUrl?: string;
  expiresInHours?: number;
  emergency?: boolean;
}

interface UseNotificationFormProps {
  onSuccess?: () => void;
}

export function useNotificationForm({ onSuccess }: UseNotificationFormProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<NotificationType>('single');
  const [formValues, setFormValues] = useState<Omit<NotificationFormValues, 'type'>>({
    userId: undefined,
    departmentIds: [],
    category: 'general',
    title: '',
    message: '',
    priority: 'medium',
    actionRequired: false,
    actionUrl: '',
    expiresInHours: 24,
    emergency: false,
  });

  // Fetch departments and nurses for dropdowns
  const { data: departmentsData } = useDepartments();
  const { data: nursesData } = useNurses({});

  const departments = departmentsData?.data || [];
  const nurses = nursesData?.data || [];

  const sendNotification = useSendNotification();
  const broadcastNotification = useBroadcastNotification();

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    // Reset form when closing
    setFormValues({
      userId: undefined,
      departmentIds: [],
      category: 'general',
      title: '',
      message: '',
      priority: 'medium',
      actionRequired: false,
      actionUrl: '',
      expiresInHours: 24,
      emergency: false,
    });
    setType('single');
  };

  const handleTypeChange = (newType: NotificationType) => {
    setType(newType);
  };

  const handleChange = (field: keyof typeof formValues, value: any) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (type === 'single' && formValues.userId) {
        await sendNotification.mutateAsync({
          recipients: [formValues.userId],
          category: formValues.category,
          title: formValues.title,
          message: formValues.message,
          priority: formValues.priority,
          action_required: formValues.actionRequired,
          action_url: formValues.actionUrl,
          expires_in_hours: formValues.expiresInHours,
        });
      } else if (type === 'broadcast' && formValues.departmentIds.length > 0) {
        await broadcastNotification.mutateAsync({
          target_audience: 'department_staff',
          department_ids: formValues.departmentIds,
          title: formValues.title,
          message: formValues.message,
          priority: formValues.priority,
          emergency: formValues.emergency,
          action_required: formValues.actionRequired,
          action_url: formValues.actionUrl,
        });
      }
      
      handleClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
      // TODO: Add toast notification for error
    }
  };

  return {
    isOpen,
    type,
    formValues,
    departments,
    nurses,
    handleOpen,
    handleClose,
    handleTypeChange,
    handleChange,
    handleSubmit,
    isLoading: sendNotification.isPending || broadcastNotification.isPending,
  };
}
