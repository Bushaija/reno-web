import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertTriangle, CheckCircle, X, Loader2 } from 'lucide-react';

interface TimeOffFormData {
  start_date: string;
  end_date: string;
  request_type: 'vacation' | 'sick' | 'personal' | 'family';
  reason: string;
}

interface ConflictInfo {
  type: 'scheduling' | 'coverage' | 'policy';
  message: string;
  severity: 'warning' | 'error';
}

const TimeOffRequestForm: React.FC = () => {
  const [formData, setFormData] = useState<TimeOffFormData>({
    start_date: '',
    end_date: '',
    request_type: 'vacation',
    reason: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [conflicts, setConflicts] = useState<ConflictInfo[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [totalDays, setTotalDays] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Calculate total days when dates change
  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setTotalDays(diffDays);
      
      // Check for conflicts when dates are set
      checkForConflicts(formData.start_date, formData.end_date);
    } else {
      setTotalDays(0);
      setConflicts([]);
    }
  }, [formData.start_date, formData.end_date]);

  const checkForConflicts = async (startDate: string, endDate: string) => {
    // Simulate API call to check conflicts
    const mockConflicts: ConflictInfo[] = [];
    
    // Example conflict detection logic
    const start = new Date(startDate);
    const dayOfWeek = start.getDay();
    
    if (dayOfWeek === 1 || dayOfWeek === 5) { // Monday or Friday
      mockConflicts.push({
        type: 'coverage',
        message: 'Limited coverage available on Monday/Friday. Approval may take longer.',
        severity: 'warning'
      });
    }

    if (totalDays > 5) {
      mockConflicts.push({
        type: 'policy',
        message: 'Requests longer than 5 days require manager approval.',
        severity: 'warning'
      });
    }

    setConflicts(mockConflicts);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.start_date) {
      errors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      errors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      
      if (start > end) {
        errors.end_date = 'End date must be after start date';
      }
      
      if (start < new Date()) {
        errors.start_date = 'Start date cannot be in the past';
      }
    }

    if (!formData.reason.trim()) {
      errors.reason = 'Reason is required';
    } else if (formData.reason.trim().length < 10) {
      errors.reason = 'Please provide a more detailed reason (at least 10 characters)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock API response
      console.log('Submitting time off request:', formData);
      
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof TimeOffFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">Request Submitted Successfully!</h2>
            <p className="text-muted-foreground">
              Your time off request has been submitted for approval. You'll receive a notification once it's been reviewed.
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">Request Details:</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Dates:</strong> {formatDate(formData.start_date)} - {formatDate(formData.end_date)}</p>
                <p><strong>Type:</strong> {formData.request_type.charAt(0).toUpperCase() + formData.request_type.slice(1)}</p>
                <p><strong>Total Days:</strong> {totalDays}</p>
              </div>
            </div>
            <Button onClick={() => setSubmitted(false)} variant="outline">
              Submit Another Request
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Request Time Off
        </CardTitle>
        <CardDescription>
          Submit a request for vacation, sick leave, or personal time off
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className={validationErrors.start_date ? 'border-red-500' : ''}
                min={new Date().toISOString().split('T')[0]}
              />
              {validationErrors.start_date && (
                <p className="text-sm text-red-500">{validationErrors.start_date}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                className={validationErrors.end_date ? 'border-red-500' : ''}
                min={formData.start_date || new Date().toISOString().split('T')[0]}
              />
              {validationErrors.end_date && (
                <p className="text-sm text-red-500">{validationErrors.end_date}</p>
              )}
            </div>
          </div>

          {/* Total Days Display */}
          {totalDays > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                Total Days: {totalDays}
              </Badge>
            </div>
          )}

          {/* Request Type */}
          <div className="space-y-2">
            <Label htmlFor="request_type">Request Type</Label>
            <Select 
              value={formData.request_type} 
              onValueChange={(value: 'vacation' | 'sick' | 'personal' | 'family') => 
                handleInputChange('request_type', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select request type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vacation">Vacation</SelectItem>
                <SelectItem value="sick">Sick Leave</SelectItem>
                <SelectItem value="personal">Personal Time</SelectItem>
                <SelectItem value="family">Family Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason for your time off request..."
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              className={validationErrors.reason ? 'border-red-500' : ''}
              rows={4}
            />
            {validationErrors.reason && (
              <p className="text-sm text-red-500">{validationErrors.reason}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {formData.reason.length}/500 characters
            </p>
          </div>

          {/* Conflicts Display */}
          {conflicts.length > 0 && (
            <div className="space-y-2">
              {conflicts.map((conflict, index) => (
                <Alert key={index} className={conflict.severity === 'error' ? 'border-red-200' : 'border-yellow-200'}>
                  <AlertTriangle className={`h-4 w-4 ${conflict.severity === 'error' ? 'text-red-500' : 'text-yellow-500'}`} />
                  <AlertDescription className={conflict.severity === 'error' ? 'text-red-700' : 'text-yellow-700'}>
                    {conflict.message}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                setFormData({
                  start_date: '',
                  end_date: '',
                  request_type: 'vacation',
                  reason: ''
                });
                setValidationErrors({});
                setConflicts([]);
                setTotalDays(0);
              }}
            >
              Clear Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TimeOffRequestForm;