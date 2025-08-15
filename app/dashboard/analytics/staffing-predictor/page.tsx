'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calculator, 
  TrendingUp, 
  Users, 
  Calendar, 
  Building2, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { useStaffPrediction } from '@/hooks/use-staff-prediction';
import { useDepartments as useDepartmentsHook } from '@/hooks/use-departments';

export default function StaffingPredictorPage() {
  const [formData, setFormData] = useState({
    department_id: '',
    prediction_date: new Date().toISOString().split('T')[0],
    shift_type: 'day' as 'day' | 'night' | 'evening',
    expected_patient_count: 15,
    expected_acuity: 'medium' as 'low' | 'medium' | 'high',
  });

  // Fetch departments for the dropdown
  const { data: departmentsResponse, isLoading: departmentsLoading } = useDepartmentsHook();
  const departments = departmentsResponse?.success ? departmentsResponse.data : [];

  // Staff prediction hook
  const { 
    mutate: predictStaffing, 
    data: predictionData, 
    isPending: isPredicting, 
    error: predictionError 
  } = useStaffPrediction();

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'expected_patient_count' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.department_id) {
      alert('Please select a department');
      return;
    }

    predictStaffing({
      department_id: parseInt(formData.department_id),
      prediction_date: formData.prediction_date,
      shift_type: formData.shift_type,
      expected_patient_count: formData.expected_patient_count,
      expected_acuity: formData.expected_acuity,
    });
  };

  const getAcuityColor = (acuity: string) => {
    switch (acuity) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getShiftTypeColor = (shift: string) => {
    switch (shift) {
      case 'day': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'night': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'evening': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Staffing Predictor</h1>
          <p className="text-muted-foreground">
            AI-powered staffing predictions based on historical data, patient acuity, and seasonal factors
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            View History
          </Button>
          <Button variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Prediction Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Prediction Parameters
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter the parameters for your staffing prediction
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Department Selection */}
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select 
                  value={formData.department_id} 
                  onValueChange={(value) => handleInputChange('department_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentsLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading departments...
                      </SelectItem>
                    ) : (
                      departments.map((dept) => (
                        <SelectItem key={dept.deptId} value={dept.deptId.toString()}>
                          {dept.deptName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <Label htmlFor="date">Prediction Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.prediction_date}
                  onChange={(e) => handleInputChange('prediction_date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Shift Type */}
              <div className="space-y-2">
                <Label htmlFor="shift">Shift Type</Label>
                <Select 
                  value={formData.shift_type} 
                  onValueChange={(value) => handleInputChange('shift_type', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day Shift (7 AM - 7 PM)</SelectItem>
                    <SelectItem value="evening">Evening Shift (3 PM - 11 PM)</SelectItem>
                    <SelectItem value="night">Night Shift (11 PM - 7 AM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Patient Count */}
              <div className="space-y-2">
                <Label htmlFor="patients">Expected Patient Count</Label>
                <Input
                  id="patients"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.expected_patient_count}
                  onChange={(e) => handleInputChange('expected_patient_count', e.target.value)}
                />
              </div>

              {/* Acuity Level */}
              <div className="space-y-2">
                <Label htmlFor="acuity">Expected Patient Acuity</Label>
                <Select 
                  value={formData.expected_acuity} 
                  onValueChange={(value) => handleInputChange('expected_acuity', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Acuity</SelectItem>
                    <SelectItem value="medium">Medium Acuity</SelectItem>
                    <SelectItem value="high">High Acuity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isPredicting || !formData.department_id}
              >
                {isPredicting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Predicting...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Predict Staffing Needs
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Prediction Results */}
        <div className="space-y-6">
          {/* Current Selection Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Prediction Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Department</Label>
                  <div className="font-medium">
                    {departments.find(d => d.deptId.toString() === formData.department_id)?.deptName || 'Not selected'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Date</Label>
                  <div className="font-medium">{formData.prediction_date}</div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Shift</Label>
                  <Badge className={getShiftTypeColor(formData.shift_type)}>
                    {formData.shift_type.charAt(0).toUpperCase() + formData.shift_type.slice(1)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Patients</Label>
                  <div className="font-medium">{formData.expected_patient_count}</div>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="text-xs text-muted-foreground">Acuity</Label>
                  <Badge className={getAcuityColor(formData.expected_acuity)}>
                    {formData.expected_acuity.charAt(0).toUpperCase() + formData.expected_acuity.slice(1)} Acuity
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prediction Results */}
          {isPredicting && (
            <Card>
              <CardHeader>
                <CardTitle>Analyzing...</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {predictionError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Failed to generate prediction. Please try again.
              </AlertDescription>
            </Alert>
          )}

          {predictionData?.success && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Prediction Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Main Recommendation */}
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-primary">
                    {predictionData.data.recommended_nurses}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Recommended Nurses
                  </div>
                </div>

                {/* Confidence Score */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Confidence Score</span>
                    <span className={`font-medium ${getConfidenceColor(predictionData.data.confidence_score)}`}>
                      {(predictionData.data.confidence_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress 
                    value={predictionData.data.confidence_score * 100} 
                    className="h-2" 
                  />
                </div>

                <Separator />

                {/* Contributing Factors */}
                <div className="space-y-3">
                  <h4 className="font-medium">Contributing Factors</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Historical Average</div>
                      <div className="font-medium">{predictionData.data.factors.historical_average}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Acuity Adjustment</div>
                      <div className="font-medium">{predictionData.data.factors.acuity_adjustment}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Seasonal Factor</div>
                      <div className="font-medium">{predictionData.data.factors.seasonal_factor}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-muted-foreground">Day of Week</div>
                      <div className="font-medium">{predictionData.data.factors.day_of_week_factor}</div>
                    </div>
                  </div>
                </div>

                {/* Risk Indicators */}
                {predictionData.data.risk_indicators.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Risk Indicators
                      </h4>
                      <div className="space-y-2">
                        {predictionData.data.risk_indicators.map((risk, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                            <span>{risk.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Additional Features */}
      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="comparison">Historical Comparison</TabsTrigger>
          <TabsTrigger value="optimization">Optimization Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
              <p className="text-sm text-muted-foreground">
                Machine learning insights based on your prediction
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                AI insights will appear here after making a prediction...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historical Comparison</CardTitle>
              <p className="text-sm text-muted-foreground">
                Compare with similar historical periods
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Historical comparison data will appear here...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Tips</CardTitle>
              <p className="text-sm text-muted-foreground">
                Recommendations for optimal staffing
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Optimization tips will appear here...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}