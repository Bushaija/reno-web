'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useNotificationForm } from '@/hooks/use-notification-form';

interface NotificationDialogProps {
  onNotificationSent?: () => void | Promise<void>;
}

export function NotificationDialog({ onNotificationSent }: NotificationDialogProps) {
  const {
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
    isLoading,
  } = useNotificationForm();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(e);
  };

  return (
    <>
      <Button onClick={handleOpen} variant="outline" className="ml-2">
        New Notification
      </Button>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogTrigger asChild>
          <span className="hidden">Open Dialog</span>
        </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Notification</DialogTitle>
        </DialogHeader>

        <Tabs 
          value={type} 
          onValueChange={(value) => handleTypeChange(value as 'single' | 'broadcast')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Recipient</TabsTrigger>
            <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
          </TabsList>

          <form onSubmit={handleFormSubmit} className="space-y-4 mt-4">
            {type === 'single' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nurse">Recipient</Label>
                  <Select
                    value={formValues.userId?.toString() || ''}
                    onValueChange={(value) => handleChange('userId', parseInt(value))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a nurse" />
                    </SelectTrigger>
                    <SelectContent>
                      {nurses.map((nurse) => (
                        <SelectItem 
                          key={nurse.worker_id} 
                          value={nurse.worker_id.toString()}
                        >
                          {nurse.user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formValues.category}
                    onValueChange={(value) => handleChange('category', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shift_update">Shift Update</SelectItem>
                      <SelectItem value="system_maintenance">System Maintenance</SelectItem>
                      <SelectItem value="staffing_alert">Staffing Alert</SelectItem>
                      <SelectItem value="compliance_warning">Compliance Warning</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Departments</Label>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (!formValues.departmentIds.includes(parseInt(value))) {
                        handleChange('departmentIds', [...formValues.departmentIds, parseInt(value)]);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select departments" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem 
                          key={dept.deptId} 
                          value={dept.deptId.toString()}
                          disabled={formValues.departmentIds.includes(dept.deptId)}
                        >
                          {dept.deptName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {formValues.departmentIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formValues.departmentIds.map((deptId) => {
                        const dept = departments.find(d => d.deptId === deptId);
                        return (
                          <div 
                            key={deptId} 
                            className="bg-gray-100 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                          >
                            {dept?.deptName || deptId}
                            <button
                              type="button"
                              onClick={() => {
                                handleChange(
                                  'departmentIds', 
                                  formValues.departmentIds.filter(id => id !== deptId)
                                );
                              }}
                              className="text-gray-500 hover:text-red-500"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="emergency"
                    checked={formValues.emergency}
                    onCheckedChange={(checked) => handleChange('emergency', checked)}
                  />
                  <Label htmlFor="emergency">Emergency Broadcast</Label>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formValues.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter notification title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={formValues.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder="Enter notification message"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formValues.priority}
                    onValueChange={(value) => handleChange('priority', value as any)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiresInHours">Expires In (hours)</Label>
                  <Input
                    id="expiresInHours"
                    type="number"
                    min="1"
                    value={formValues.expiresInHours}
                    onChange={(e) => handleChange('expiresInHours', parseInt(e.target.value) || 24)}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="actionRequired"
                    checked={formValues.actionRequired}
                    onCheckedChange={(checked) => handleChange('actionRequired', checked)}
                  />
                  <Label htmlFor="actionRequired">Action Required</Label>
                </div>

                {formValues.actionRequired && (
                  <div className="space-y-2">
                    <Label htmlFor="actionUrl">Action URL (optional)</Label>
                    <Input
                      id="actionUrl"
                      type="url"
                      value={formValues.actionUrl}
                      onChange={(e) => handleChange('actionUrl', e.target.value)}
                      placeholder="https://example.com/action"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Notification'}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
      </Dialog>
    </>
  );
}
