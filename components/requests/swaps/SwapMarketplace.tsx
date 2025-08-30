import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Filter, Clock, MapPin, Star, Users, Calendar, ArrowRightLeft } from 'lucide-react';

interface SwapOpportunity {
  swap_id: number;
  requesting_nurse: {
    name: string;
    employee_id: string;
    specialization: string;
  };
  original_shift: {
    shift_id: number;
    department: { name: string };
    start_time: string;
    end_time: string;
    shift_type: string;
  };
  reason: string;
  compatibility_score: number;
  match_reasons: string[];
  expires_at: string;
  created_at: string;
}

const SwapMarketplace: React.FC = () => {
  const [opportunities, setOpportunities] = useState<SwapOpportunity[]>([
    {
      swap_id: 1,
      requesting_nurse: {
        name: "Sarah Johnson",
        employee_id: "RN001234",
        specialization: "ICU"
      },
      original_shift: {
        shift_id: 789,
        department: { name: "ICU" },
        start_time: "2024-03-25T19:00:00Z",
        end_time: "2024-03-26T07:00:00Z",
        shift_type: "night"
      },
      reason: "Family event",
      compatibility_score: 95,
      match_reasons: ["Same specialization", "High compatibility score", "No conflicts"],
      expires_at: "2024-03-20T10:00:00Z",
      created_at: "2024-03-15T10:00:00Z"
    },
    {
      swap_id: 2,
      requesting_nurse: {
        name: "Mike Chen",
        employee_id: "RN005678",
        specialization: "Emergency"
      },
      original_shift: {
        shift_id: 790,
        department: { name: "Emergency" },
        start_time: "2024-03-22T07:00:00Z",
        end_time: "2024-03-22T19:00:00Z",
        shift_type: "day"
      },
      reason: "Medical appointment",
      compatibility_score: 78,
      match_reasons: ["Available during shift", "Department cross-training"],
      expires_at: "2024-03-19T10:00:00Z",
      created_at: "2024-03-14T10:00:00Z"
    }
  ]);

  const [filteredOpportunities, setFilteredOpportunities] = useState<SwapOpportunity[]>(opportunities);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    shift_type: '',
    min_compatibility: 70
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    filterOpportunities();
  }, [searchTerm, filters, opportunities]);

  const filterOpportunities = () => {
    let filtered = opportunities;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(opp => 
        opp.requesting_nurse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.original_shift.department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Department filter
    if (filters.department) {
      filtered = filtered.filter(opp => 
        opp.original_shift.department.name === filters.department
      );
    }

    // Shift type filter
    if (filters.shift_type) {
      filtered = filtered.filter(opp => 
        opp.original_shift.shift_type === filters.shift_type
      );
    }

    // Compatibility filter
    filtered = filtered.filter(opp => 
      opp.compatibility_score >= filters.min_compatibility
    );

    setFilteredOpportunities(filtered);
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    };
  };

  const getTimeUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours} hours`;
    } else {
      return `${Math.floor(diffHours / 24)} days`;
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const handleAcceptSwap = async (swapId: number) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Accepting swap:', swapId);
      // Remove from opportunities or update status
      setOpportunities(prev => prev.filter(opp => opp.swap_id !== swapId));
    } catch (error) {
      console.error('Error accepting swap:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Swap Marketplace</h2>
          <p className="text-muted-foreground">
            Find and accept shift swap opportunities
          </p>
        </div>
        <Button>
          <ArrowRightLeft className="h-4 w-4 mr-2" />
          Create Swap Request
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.department} onValueChange={(value: string) => setFilters(prev => ({ ...prev, department: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                <SelectItem value="ICU">ICU</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
                <SelectItem value="Surgery">Surgery</SelectItem>
                <SelectItem value="Pediatrics">Pediatrics</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.shift_type} onValueChange={(value: string) => setFilters(prev => ({ ...prev, shift_type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Shift Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Shifts</SelectItem>
                <SelectItem value="day">Day Shift</SelectItem>
                <SelectItem value="night">Night Shift</SelectItem>
                <SelectItem value="evening">Evening Shift</SelectItem>
                <SelectItem value="weekend">Weekend</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.min_compatibility.toString()} 
              onValueChange={(value: string) => setFilters(prev => ({ ...prev, min_compatibility: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Min Compatibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50%+ Match</SelectItem>
                <SelectItem value="70">70%+ Match</SelectItem>
                <SelectItem value="80">80%+ Match</SelectItem>
                <SelectItem value="90">90%+ Match</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredOpportunities.length} of {opportunities.length} opportunities
        </p>
        <Badge variant="outline" className="flex items-center gap-1">
          <Star className="h-3 w-3" />
          Best matches first
        </Badge>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredOpportunities.map((opportunity) => {
          const startDateTime = formatDateTime(opportunity.original_shift.start_time);
          const endDateTime = formatDateTime(opportunity.original_shift.end_time);
          const timeUntilExpiry = getTimeUntilExpiry(opportunity.expires_at);

          return (
            <Card key={opportunity.swap_id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {opportunity.requesting_nurse.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {opportunity.requesting_nurse.employee_id}
                      </Badge>
                      <span className="text-xs">{opportunity.requesting_nurse.specialization}</span>
                    </CardDescription>
                  </div>
                  <Badge className={getCompatibilityColor(opportunity.compatibility_score)}>
                    {opportunity.compatibility_score}% Match
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Shift Details */}
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{opportunity.original_shift.department.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {opportunity.original_shift.shift_type}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{startDateTime.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{startDateTime.time} - {endDateTime.time}</span>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Reason for swap:</p>
                  <p className="text-sm">{opportunity.reason}</p>
                </div>

                {/* Match Reasons */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Why this is a good match:</p>
                  <div className="flex flex-wrap gap-1">
                    {opportunity.match_reasons.map((reason, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Expiry Warning */}
                <Alert className="py-2">
                  <Clock className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Expires in {timeUntilExpiry}
                  </AlertDescription>
                </Alert>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={() => handleAcceptSwap(opportunity.swap_id)}
                    disabled={loading}
                    className="flex-1"
                  >
                    Accept Swap
                  </Button>
                  <Button variant="outline" className="flex-1">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredOpportunities.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <ArrowRightLeft className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-medium">No swap opportunities found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or check back later for new opportunities.
              </p>
              <Button variant="outline">
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SwapMarketplace;