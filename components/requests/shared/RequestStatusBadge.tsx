import React from 'react';
import { Badge } from '@ui/badge';

type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired' | 'open_swap';

interface RequestStatusBadgeProps {
  status: RequestStatus;
}

const RequestStatusBadge: React.FC<RequestStatusBadgeProps> = ({ status }) => {
  const statusStyles: Record<RequestStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200',
    expired: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
    open_swap: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
  };

  const formattedStatus = status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <Badge className={statusStyles[status] || 'bg-gray-100'}>
      {formattedStatus}
    </Badge>
  );
};

export default RequestStatusBadge;
