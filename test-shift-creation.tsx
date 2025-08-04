"use client";

import React, { useState } from 'react';
import { useCreateShift } from '@/features/shifts/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function TestShiftCreation() {
  const createShift = useCreateShift();
  const [testData, setTestData] = useState({
    workerId: 1,
    startTime: '2025-07-30T08:00:00.000Z',
    endTime: '2025-07-30T16:00:00.000Z',
    department: 'Test Department',
    maxStaff: 2,
    notes: 'Test shift',
    status: 'scheduled' as const,
  });

  const handleTest = async () => {
    try {
      console.log('Testing with data:', testData);
      const result = await createShift.mutateAsync(testData);
      console.log('Success:', result);
      toast.success('Shift created successfully!');
    } catch (error) {
      console.error('Test failed:', error);
      toast.error('Test failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const testCases = [
    {
      name: 'Valid Shift',
      data: {
        workerId: 1,
        startTime: '2025-07-30T08:00:00.000Z',
        endTime: '2025-07-30T16:00:00.000Z',
        department: 'Emergency',
        maxStaff: 3,
        notes: 'Regular shift',
        status: 'scheduled' as const,
      }
    },
    {
      name: 'Long Shift',
      data: {
        workerId: 1,
        startTime: '2025-07-30T06:00:00.000Z',
        endTime: '2025-07-30T18:00:00.000Z',
        department: 'ICU',
        maxStaff: 2,
        notes: '12-hour shift',
        status: 'scheduled' as const,
      }
    },
    {
      name: 'Invalid Worker ID',
      data: {
        workerId: 999, // Non-existent worker
        startTime: '2025-07-30T08:00:00.000Z',
        endTime: '2025-07-30T16:00:00.000Z',
        department: 'Test',
        maxStaff: 1,
        notes: 'Test with invalid worker',
        status: 'scheduled' as const,
      }
    }
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Shift Creation</h1>
      
      <div className="space-y-4">
        <div>
          <Label>Worker ID</Label>
          <Input
            type="number"
            value={testData.workerId}
            onChange={(e) => setTestData(prev => ({ ...prev, workerId: parseInt(e.target.value) }))}
          />
        </div>
        
        <div>
          <Label>Department</Label>
          <Input
            value={testData.department}
            onChange={(e) => setTestData(prev => ({ ...prev, department: e.target.value }))}
          />
        </div>
        
        <div>
          <Label>Start Time</Label>
          <Input
            type="datetime-local"
            value={testData.startTime.slice(0, 16)}
            onChange={(e) => setTestData(prev => ({ 
              ...prev, 
              startTime: new Date(e.target.value).toISOString() 
            }))}
          />
        </div>
        
        <div>
          <Label>End Time</Label>
          <Input
            type="datetime-local"
            value={testData.endTime.slice(0, 16)}
            onChange={(e) => setTestData(prev => ({ 
              ...prev, 
              endTime: new Date(e.target.value).toISOString() 
            }))}
          />
        </div>
        
        <div>
          <Label>Max Staff</Label>
          <Input
            type="number"
            value={testData.maxStaff}
            onChange={(e) => setTestData(prev => ({ ...prev, maxStaff: parseInt(e.target.value) }))}
          />
        </div>
        
        <div>
          <Label>Notes</Label>
          <Input
            value={testData.notes}
            onChange={(e) => setTestData(prev => ({ ...prev, notes: e.target.value }))}
          />
        </div>
        
        <Button 
          onClick={handleTest} 
          disabled={createShift.isPending}
          className="w-full"
        >
          {createShift.isPending ? 'Creating...' : 'Test Create Shift'}
        </Button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Predefined Test Cases</h2>
        <div className="space-y-2">
          {testCases.map((testCase, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => {
                setTestData(testCase.data);
                toast.info(`Loaded test case: ${testCase.name}`);
              }}
              className="w-full justify-start"
            >
              {testCase.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Current Test Data:</h3>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(testData, null, 2)}
        </pre>
      </div>
    </div>
  );
} 