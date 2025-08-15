'use client';

import { useState } from 'react';
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from '@/hooks/use-departments';
import { useRealTimeAttendance, useNurseStatuses } from '@/hooks/use-get-real-time-attendance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Clock, 
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export const DepartmentsDemo = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceFilters, setAttendanceFilters] = useState({
    nurse_id: undefined,
    status: undefined
  });

  // Department hooks
  const { data: departmentsResponse, isLoading: departmentsLoading } = useDepartments({
    search: searchTerm || undefined,
    limit: 50
  });

  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();

  // Attendance hooks
  const { data: attendanceResponse, isLoading: attendanceLoading } = useRealTimeAttendance(attendanceFilters);
  const { data: nurseStatusesResponse, isLoading: nurseStatusesLoading } = useNurseStatuses({
    search: '',
    departmentId: 'all',
    status: 'all'
  });

  const departments = departmentsResponse?.data || [];
  const attendanceRecords = attendanceResponse?.data || [];
  const nurseStatuses = nurseStatusesResponse?.data || [];

  const handleCreateDepartment = async (formData: FormData) => {
    const departmentData = {
      deptName: formData.get('deptName') as string,
      minNursesPerShift: parseInt(formData.get('minNursesPerShift') as string) || 1,
      maxNursesPerShift: parseInt(formData.get('maxNursesPerShift') as string) || 10,
      patientCapacity: parseInt(formData.get('patientCapacity') as string) || 20,
      acuityMultiplier: parseFloat(formData.get('acuityMultiplier') as string) || 1.0,
      shiftOverlapMinutes: parseInt(formData.get('shiftOverlapMinutes') as string) || 30,
    };

    try {
      await createDepartment.mutateAsync(departmentData);
      toast.success('Department created successfully!');
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast.error('Failed to create department');
    }
  };

  const handleUpdateDepartment = async (formData: FormData) => {
    if (!editingDepartment) return;

    const updateData = {
      deptName: formData.get('deptName') as string,
      minNursesPerShift: parseInt(formData.get('minNursesPerShift') as string) || 1,
      maxNursesPerShift: parseInt(formData.get('maxNursesPerShift') as string) || 10,
      patientCapacity: parseInt(formData.get('patientCapacity') as string) || 20,
      acuityMultiplier: parseFloat(formData.get('acuityMultiplier') as string) || 1.0,
      shiftOverlapMinutes: parseInt(formData.get('shiftOverlapMinutes') as string) || 30,
    };

    try {
      await updateDepartment.mutateAsync({
        deptId: editingDepartment.deptId,
        data: updateData
      });
      toast.success('Department updated successfully!');
      setIsEditDialogOpen(false);
      setEditingDepartment(null);
    } catch (error) {
      toast.error('Failed to update department');
    }
  };

  const handleDeleteDepartment = async (deptId: number) => {
    try {
      await deleteDepartment.mutateAsync(deptId);
      toast.success('Department deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete department');
    }
  };

  const openEditDialog = (department: any) => {
    setEditingDepartment(department);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments & Attendance Demo</h1>
          <p className="text-muted-foreground">
            Demonstrating the integration of department and attendance hooks
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Department
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Department</DialogTitle>
              <DialogDescription>
                Add a new department to the system
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreateDepartment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deptName">Department Name</Label>
                  <Input id="deptName" name="deptName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patientCapacity">Patient Capacity</Label>
                  <Input id="patientCapacity" name="patientCapacity" type="number" defaultValue="20" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minNursesPerShift">Min Nurses/Shift</Label>
                  <Input id="minNursesPerShift" name="minNursesPerShift" type="number" defaultValue="1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxNursesPerShift">Max Nurses/Shift</Label>
                  <Input id="maxNursesPerShift" name="maxNursesPerShift" type="number" defaultValue="10" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="acuityMultiplier">Acuity Multiplier</Label>
                  <Input id="acuityMultiplier" name="acuityMultiplier" type="number" step="0.1" defaultValue="1.0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shiftOverlapMinutes">Shift Overlap (min)</Label>
                  <Input id="shiftOverlapMinutes" name="shiftOverlapMinutes" type="number" defaultValue="30" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createDepartment.isPending}>
                  {createDepartment.isPending ? 'Creating...' : 'Create Department'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="departments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="attendance">Real-time Attendance</TabsTrigger>
          <TabsTrigger value="nurse-statuses">Nurse Statuses</TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="space-y-4">
          {/* Search */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Departments Grid */}
          {departmentsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map((dept) => (
                <Card key={dept.deptId} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{dept.deptName}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(dept)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Department</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{dept.deptName}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteDepartment(dept.deptId)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Patient Capacity:</span>
                      <Badge variant="secondary">{dept.patientCapacity}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Nurses per Shift:</span>
                      <Badge variant="outline">
                        {dept.minNursesPerShift}-{dept.maxNursesPerShift}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Acuity:</span>
                      <Badge variant="outline">{dept.acuityMultiplier}x</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!departmentsLoading && departments.length === 0 && (
            <Card className="p-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No departments found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first department.'}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Department
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Real-time Attendance Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {attendanceLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading attendance data...</p>
                </div>
              ) : attendanceRecords.length > 0 ? (
                <div className="space-y-4">
                  {attendanceRecords.slice(0, 5).map((record) => (
                    <div key={record.record_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Shift #{record.assignment.shift_id}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(record.scheduled_start).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={record.status === 'present' ? 'default' : 'secondary'}>
                          {record.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {record.clock_in_time ? 'Clocked in' : 'Not clocked in'}
                        </p>
                      </div>
                    </div>
                  ))}
                  <p className="text-sm text-muted-foreground text-center">
                    Showing {Math.min(attendanceRecords.length, 5)} of {attendanceRecords.length} records
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No attendance records found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nurse-statuses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Nurse Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nurseStatusesLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading nurse statuses...</p>
                </div>
              ) : nurseStatuses.length > 0 ? (
                <div className="space-y-4">
                  {nurseStatuses.slice(0, 5).map((nurse) => (
                    <div key={nurse.nurse_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {nurse.first_name.charAt(0)}{nurse.last_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{nurse.first_name} {nurse.last_name}</p>
                          <p className="text-sm text-muted-foreground">{nurse.department.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={
                            nurse.status === 'PRESENT' ? 'default' : 
                            nurse.status === 'LATE' ? 'secondary' : 
                            nurse.status === 'ABSENT' ? 'destructive' : 'outline'
                          }
                        >
                          {nurse.status.replace('_', ' ')}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {nurse.patient_ratio.current}/{nurse.patient_ratio.max} patients
                        </p>
                      </div>
                    </div>
                  ))}
                  <p className="text-sm text-muted-foreground text-center">
                    Showing {Math.min(nurseStatuses.length, 5)} of {nurseStatuses.length} nurses
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No nurse statuses found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Department Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>
              Update department information
            </DialogDescription>
          </DialogHeader>
          {editingDepartment && (
            <form action={handleUpdateDepartment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-deptName">Department Name</Label>
                  <Input 
                    id="edit-deptName" 
                    name="deptName" 
                    defaultValue={editingDepartment.deptName}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-patientCapacity">Patient Capacity</Label>
                  <Input 
                    id="edit-patientCapacity" 
                    name="patientCapacity" 
                    type="number" 
                    defaultValue={editingDepartment.patientCapacity} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-minNursesPerShift">Min Nurses/Shift</Label>
                  <Input 
                    id="edit-minNursesPerShift" 
                    name="minNursesPerShift" 
                    type="number" 
                    defaultValue={editingDepartment.minNursesPerShift} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-maxNursesPerShift">Max Nurses/Shift</Label>
                  <Input 
                    id="edit-maxNursesPerShift" 
                    name="maxNursesPerShift" 
                    type="number" 
                    defaultValue={editingDepartment.maxNursesPerShift} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-acuityMultiplier">Acuity Multiplier</Label>
                  <Input 
                    id="edit-acuityMultiplier" 
                    name="acuityMultiplier" 
                    type="number" 
                    step="0.1" 
                    defaultValue={editingDepartment.acuityMultiplier} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-shiftOverlapMinutes">Shift Overlap (min)</Label>
                  <Input 
                    id="edit-shiftOverlapMinutes" 
                    name="shiftOverlapMinutes" 
                    type="number" 
                    defaultValue={editingDepartment.shiftOverlapMinutes} 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={updateDepartment.isPending}>
                  {updateDepartment.isPending ? 'Updating...' : 'Update Department'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
