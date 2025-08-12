import React from 'react';
import { Badge } from '@ui/badge';

interface SwapCompatibilityBadgeProps {
  score: number;
}

const SwapCompatibilityBadge: React.FC<SwapCompatibilityBadgeProps> = ({ score }) => {
  const getBadgeStyle = () => {
    if (score >= 0.8) {
      return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
    } else if (score >= 0.6) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
    } else {
      return 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200';
    }
  };

  const getBadgeText = () => {
    if (score >= 0.8) {
      return 'High Match';
    } else if (score >= 0.6) {
      return 'Good Match';
    } else {
      return 'Fair Match';
    }
  };

  return (
    <Badge className={getBadgeStyle()}>
      {getBadgeText()} ({Math.round(score * 100)}%)
    </Badge>
  );
};

export default SwapCompatibilityBadge;
