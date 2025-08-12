import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowRightLeft, 
  Calendar, 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle,
  Search,
  MapPin,
  Star,
  Loader2
} from 'lucide-react';

interface AssignedShift {
  shift_id: number;
  department: { name: string };
  start_time: string;
  end_time: string;
  shift_type: string;
  patient_count: number;
}

interface CompatibleNurse {
  worker_id: number;
  user: { name: string };
  employee_id: string;
  specialization: string;
  department: string;
  compatibility_score: number;
  available_shifts: AssignedShift[];
}

interface SwapFormData {
  original_shift_id: number;
  target_nurse_id?: number;
  requested_shift_id?: number;
  swap_type: 'full_shift' | 'partial_shift' | 'open_swap';
  reason: string;
  expires_in_hours: number;
}

const SwapRequestForm: React.FC = () => {
  const [formData, setFormData] = useState<SwapFormData>({
    original_shift_id: 0,
    target_nurse_id: undefined,
    requested_shift_id: undefined,
    swap_type: 'full_shift',
    reason: '',
    expires_in_hours: 72
  });

  const [myShifts] = useState<AssignedShift[]>([
    {
      shift_id: 1001,
      department: { name: 'ICU' },
      start_time: '2024-03-25T07:00:00Z',
      end_time: '2024-03-25T19:00:00Z',
      shift_type: 'day',
      patient_count: 6
    },
    {
      shift_id: 1002,
      department: { name: 'ICU' },
      start_time: '2024-03-27T19:00:00Z',
      end_time: '2024-03-28T07:00:00Z',
      shift_type: 'night',
      patient_count: 4
    }
  ]);

  const [compatibleNurses] = useState<CompatibleNurse[]>([
    {
      worker_id: 201,
      user: { name: 'Sarah Johnson' },
      employee_id: 'RN005678',
      specialization: 'ICU',
      department: 'Critical Care',
      compatibility_score: 95,
      available_shifts: [
        {
          shift_id: 2001,
          department: { name: 'ICU' },
          start_time: '2024-03-26T07:00:00Z',
          end_time: '2024-03-26T19:00:00Z',
          shift_type: 'day',
          patient_count: 5
        }
      ]
    },
    {
      worker_id: 202,
      user: { name: 'Mike Chen' },
      employee_id: 'RN009876',
      specialization: 'Emergency',
      department: 'Emergency',
      compatibility_score: 78,
      available_shifts: []
    }
  ]);

  const [selectedShift, setSelectedShift] = useState<AssignedShift | null>(null);
  const [selectedNurse, setSelectedNurse] = useState<CompatibleNurse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState<'shift' | 'type' | 'target' | 'details' | 'review'>('shift');

  useEffect(() => {
    if (formData.original_shift_id) {
      const shift = myShifts.find(s => s.shift_id === formData.original_shift_id);
      setSelectedShift(shift || null);
    }
  }, [formData.original_shift_id, myShifts]);

  useEffect(() => {
    if (formData.target_nurse_id) {
      const nurse = compatibleNurses.find(n => n.worker_id === formData.target_nurse_id);
      setSelectedNurse(nurse || null);
    }
  }, [formData.target_nurse_id, compatibleNurses]);

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const filteredNurses = compatibleNurses.filter(nurse =>
    nurse.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nurse.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nurse.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Submitting swap request:', formData);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting swap request:', error);
    } finally {
      setLoading(false);
    }
  };

  const canProceedToNext = () => {
    switch (step) {
      case 'shift':
        return formData.original_shift_id > 0;
      case 'type':
        return (formData.swap_type as any) !== '';
      case 'target':
        return formData.swap_type === 'open_swap' || formData.target_nurse_id;
      case 'details':
        return formData.reason.trim().length >= 10;
      default:
        return true;
    }
  };

  if (submitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">Swap Request Created!</h2>
            <p className="text-muted-foreground">
              Your swap request has been posted to the marketplace. You'll be notified when someone accepts your request.
            </p>
            <div className="bg-muted p-4 rounded-lg text-left">
              <h3 className="font-medium mb-2">Request Summary:</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Shift:</strong> {selectedShift && formatDateTime(selectedShift.start_time).date}</p>
                <p><strong>Type:</strong> {formData.swap_type.replace('_', ' ')}</p>
                <p><strong>Expires:</strong> {formData.expires_in_hours} hours</p>
              </div>
            </div>
            <Button onClick={() => {
              setSubmitted(false);
              setStep('shift');
              setFormData({
                original_shift_id: 0,
                target_nurse_id: undefined,
                requested_shift_id: undefined,
                swap_type: 'full_shift',
                reason: '',
                expires_in_hours: 72
              });
            }} variant="outline">
              Create Another Request
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {['shift', 'type', 'target', 'details', 'review'].map((stepName, index) => {
              const isActive = step === stepName;
              const isCompleted = ['shift', 'type', 'target', 'details', 'review'].indexOf(step) > index;
              
              return (
                <div key={stepName} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${isActive ? 'bg-primary text-primary-foreground' : 
                      isCompleted ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                  </div>
                  {index < 4 && (
                    <div className={`w-12 h-0.5 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-muted'}`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-center">
            <h3 className="font-medium capitalize">{step.replace('_', ' ')} Selection</h3>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Create Swap Request
          </CardTitle>
          <CardDescription>
            {step === 'shift' && 'Select the shift you want to swap'}
            {step === 'type' && 'Choose your swap preferences'}
            {step === 'target' && 'Find a compatible nurse (optional)'}
            {step === 'details' && 'Provide swap details and reason'}
            {step === 'review' && 'Review and submit your request'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Select Shift */}
          {step === 'shift' && (
            <div className="space-y-4">
              <Label>Select Shift to Swap</Label>
              <div className="grid gap-3">
                {myShifts.map((shift) => {
                  const { date, time } = formatDateTime(shift.start_time);
                  const endTime = formatDateTime(shift.end_time).time;
                  
                  return (
                    <Card 
                      key={shift.shift_id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        formData.original_shift_id === shift.shift_id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, original_shift_id: shift.shift_id }))}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{shift.department.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {shift.shift_type}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{time} - {endTime}</span>
                              </div>
                              <span>{shift.patient_count} patients</span>
                            </div>
                          </div>
                          {formData.original_shift_id === shift.shift_id && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Swap Type */}
          {step === 'type' && (
            <div className="space-y-4">
              <Label>Swap Type</Label>
              <RadioGroup 
                value={formData.swap_type} 
                onValueChange={(value: 'full_shift' | 'partial_shift' | 'open_swap') => 
                  setFormData(prev => ({ ...prev, swap_type: value }))
                }
              >
                <div className="space-y-3">
                  <Card className="p-4">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="full_shift" id="full_shift" />
                      <div className="flex-1">
                        <Label htmlFor="full_shift" className="font-medium">Full Shift Swap</Label>
                        <p className="text-sm text-muted-foreground">
                          Swap your entire shift with another nurse's shift
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="open_swap" id="open_swap" />
                      <div className="flex-1">
                        <Label htmlFor="open_swap" className="font-medium">Open Swap Request</Label>
                        <p className="text-sm text-muted-foreground">
                          Post your shift for anyone to pick up (no specific target)
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 opacity-50">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="partial_shift" id="partial_shift" disabled />
                      <div className="flex-1">
                        <Label htmlFor="partial_shift" className="font-medium">Partial Shift Swap</Label>
                        <p className="text-sm text-muted-foreground">
                          Swap part of your shift (Coming soon)
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 3: Target Nurse Selection */}
          {step === 'target' && formData.swap_type !== 'open_swap' && (
            <div className="space-y-4">
              <div>
                <Label>Find Compatible Nurse</Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, employee ID, or specialization..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {filteredNurses.map((nurse) => (
                  <Card 
                    key={nurse.worker_id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.target_nurse_id === nurse.worker_id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, target_nurse_id: nurse.worker_id }))}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{nurse.user.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {nurse.employee_id}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{nurse.specialization}</span>
                            <span>•</span>
                            <span>{nurse.department}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {nurse.available_shifts.length} available shifts
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getCompatibilityColor(nurse.compatibility_score)}>
                            <Star className="h-3 w-3 mr-1" />
                            {nurse.compatibility_score}%
                          </Badge>
                          {formData.target_nurse_id === nurse.worker_id && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3b: Open Swap Confirmation */}
          {step === 'target' && formData.swap_type === 'open_swap' && (
            <div className="space-y-4">
              <Alert>
                <ArrowRightLeft className="h-4 w-4" />
                <AlertDescription>
                  <strong>Open Swap Request</strong><br />
                  Your shift will be posted publicly for any qualified nurse to accept. 
                  You won't choose a specific person to swap with.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Step 4: Details */}
          {step === 'details' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Swap</Label>
                <Textarea
                  id="reason"
                  placeholder="Please explain why you need to swap this shift..."
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  rows={4}
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {formData.reason.length}/300 characters
                  </p>
                  {formData.reason.length < 10 && formData.reason.length > 0 && (
                    <p className="text-sm text-red-500">Minimum 10 characters required</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires">Request Expires In</Label>
                <Select 
                  value={formData.expires_in_hours.toString()} 
                  onValueChange={(value: string) => setFormData(prev => ({ ...prev, expires_in_hours: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="48">48 hours (2 days)</SelectItem>
                    <SelectItem value="72">72 hours (3 days)</SelectItem>
                    <SelectItem value="120">5 days</SelectItem>
                    <SelectItem value="168">1 week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 'review' && (
            <div className="space-y-6">
              <h3 className="font-medium">Review Your Swap Request</h3>
              
              <div className="grid gap-4">
                {/* Original Shift */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Your Shift</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedShift && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{selectedShift.department.name}</span>
                          <Badge variant="secondary">{selectedShift.shift_type}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDateTime(selectedShift.start_time).date} • {formatDateTime(selectedShift.start_time).time} - {formatDateTime(selectedShift.end_time).time}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Target/Swap Type */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Swap Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Type: </span>
                        <span className="font-medium">{formData.swap_type.replace('_', ' ')}</span>
                      </div>
                      
                      {selectedNurse && (
                        <div>
                          <span className="text-sm text-muted-foreground">Target Nurse: </span>
                          <span className="font-medium">{selectedNurse.user.name}</span>
                          <Badge className={`ml-2 ${getCompatibilityColor(selectedNurse.compatibility_score)}`}>
                            {selectedNurse.compatibility_score}% match
                          </Badge>
                        </div>
                      )}
                      
                      <div>
                        <span className="text-sm text-muted-foreground">Expires: </span>
                        <span className="font-medium">{formData.expires_in_hours} hours</span>
                      </div>
                      
                      <div>
                        <span className="text-sm text-muted-foreground">Reason: </span>
                        <p className="text-sm mt-1">{formData.reason}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {conflicts.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Potential Issues:</strong>
                    <ul className="mt-1 list-disc list-inside">
                      {conflicts.map((conflict, index) => (
                        <li key={index} className="text-sm">{conflict}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button 
              variant="outline"
              onClick={() => {
                const steps = ['shift', 'type', 'target', 'details', 'review'];
                const currentIndex = steps.indexOf(step);
                if (currentIndex > 0) {
                  setStep(steps[currentIndex - 1] as typeof step);
                }
              }}
              disabled={step === 'shift'}
            >
              Previous
            </Button>

            {step === 'review' ? (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Request...
                  </>
                ) : (
                  'Submit Swap Request'
                )}
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  const steps = ['shift', 'type', 'target', 'details', 'review'];
                  const currentIndex = steps.indexOf(step);
                  if (currentIndex < steps.length - 1) {
                    setStep(steps[currentIndex + 1] as typeof step);
                  }
                }}
                disabled={!canProceedToNext()}
              >
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SwapRequestForm;