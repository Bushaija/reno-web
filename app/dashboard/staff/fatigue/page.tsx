import React from 'react';
import FatigueOverview from '@/components/features/staff/fatigue/fatigue-overview';
// import IndividualTracking from '@/components/features/staff/fatigue/individual-tracking';
// import RiskAssessment from '@/components/features/staff/fatigue/risk-assessment';

const FatiguePage = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Fatigue Monitoring Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-3">
          <FatigueOverview />
        </div>
        <div className="lg:col-span-2">
          {/* <IndividualTracking /> */}
        </div>
        <div>
          {/* <RiskAssessment /> */}
        </div>
      </div>
    </div>
  );
};

export default FatiguePage;