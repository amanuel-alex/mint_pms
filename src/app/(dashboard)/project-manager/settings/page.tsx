'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Bell, 
  Users, 
  Building2,
  Save,
  Loader2,
  FileText,
  Calendar,
  DollarSign,
  Shield,
  Database,
  Palette,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Target,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface ProjectManagerSettings {
  projects: {
    defaultStatus: string;
    requireDescription: boolean;
    allowFileUpload: boolean;
    maxFileSize: number;
    autoAssignTeamMembers: boolean;
    requireTaskApproval: boolean;
    defaultPriority: string;
  };
  notifications: {
    projectUpdates: boolean;
    taskAssignments: boolean;
    budgetAlerts: boolean;
    deadlineReminders: boolean;
    teamMemberRequests: boolean;
    projectCompletion: boolean;
    budgetOverruns: boolean;
    weeklyReports: boolean;
  };
  display: {
    showProjectId: boolean;
    showCreationDate: boolean;
    showBudget: boolean;
    showTeamMembers: boolean;
    showProgressBar: boolean;
    compactMode: boolean;
    showTimeline: boolean;
  };
  team: {
    allowTeamMemberInvites: boolean;
    requireApprovalForJoining: boolean;
    maxTeamMembersPerProject: number;
    allowDirectMessages: boolean;
    showTeamMemberStatus: boolean;
    enableTeamChat: boolean;
  };
}

export default function ProjectManagerSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [settings, setSettings] = useState<ProjectManagerSettings>({
    projects: {
      defaultStatus: 'PLANNED',
      requireDescription: true,
      allowFileUpload: true,
      maxFileSize: 5,
      autoAssignTeamMembers: false,
      requireTaskApproval: true,
      defaultPriority: 'MEDIUM',
    },
    notifications: {
      projectUpdates: true,
      taskAssignments: true,
      budgetAlerts: true,
      deadlineReminders: true,
      teamMemberRequests: true,
      projectCompletion: true,
      budgetOverruns: true,
      weeklyReports: false,
    },
    display: {
      showProjectId: true,
      showCreationDate: true,
      showBudget: true,
      showTeamMembers: true,
      showProgressBar: true,
      compactMode: false,
      showTimeline: true,
    },
    team: {
      allowTeamMemberInvites: true,
      requireApprovalForJoining: true,
      maxTeamMembersPerProject: 15,
      allowDirectMessages: true,
      showTeamMemberStatus: true,
      enableTeamChat: true,
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // For now, use default settings since we don't have project manager specific settings API
        // In a real implementation, you'd fetch from /api/project-manager/settings
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSettingChange = (section: keyof ProjectManagerSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // For now, simulate saving since we don't have the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({
      projects: {
        defaultStatus: 'PLANNED',
        requireDescription: true,
        allowFileUpload: true,
        maxFileSize: 5,
        autoAssignTeamMembers: false,
        requireTaskApproval: true,
        defaultPriority: 'MEDIUM',
      },
      notifications: {
        projectUpdates: true,
        taskAssignments: true,
        budgetAlerts: true,
        deadlineReminders: true,
        teamMemberRequests: true,
        projectCompletion: true,
        budgetOverruns: true,
        weeklyReports: false,
      },
      display: {
        showProjectId: true,
        showCreationDate: true,
        showBudget: true,
        showTeamMembers: true,
        showProgressBar: true,
        compactMode: false,
        showTimeline: true,
      },
      team: {
        allowTeamMemberInvites: true,
        requireApprovalForJoining: true,
        maxTeamMembersPerProject: 15,
        allowDirectMessages: true,
        showTeamMemberStatus: true,
        enableTeamChat: true,
      }
    });
    setHasChanges(false);
    toast.success('Settings reset to defaults');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-8 h-8 text-gray-700" />
            Project Manager Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500">Configure your project management preferences</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={handleReset}
            disabled={isSaving}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="bg-gray-600 hover:bg-gray-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          <span className="text-blue-800 text-sm">You have unsaved changes</span>
        </div>
      )}

      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="display" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Display
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Project Settings
              </CardTitle>
              <CardDescription>Configure your project management preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Default Project Status</Label>
                  <Select
                    value={settings.projects.defaultStatus}
                    onValueChange={(value) => handleSettingChange('projects', 'defaultStatus', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select default status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLANNED">Planned</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Default Task Priority</Label>
                  <Select
                    value={settings.projects.defaultPriority}
                    onValueChange={(value) => handleSettingChange('projects', 'defaultPriority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select default priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Max File Size (MB)</Label>
                  <Input
                    type="number"
                    value={settings.projects.maxFileSize}
                    onChange={(e) => handleSettingChange('projects', 'maxFileSize', parseInt(e.target.value))}
                    placeholder="5"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max Team Members Per Project</Label>
                  <Input
                    type="number"
                    value={settings.team.maxTeamMembersPerProject}
                    onChange={(e) => handleSettingChange('team', 'maxTeamMembersPerProject', parseInt(e.target.value))}
                    placeholder="15"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Description</Label>
                    <p className="text-sm text-gray-500">Make project description mandatory</p>
                  </div>
                  <Switch
                    checked={settings.projects.requireDescription}
                    onCheckedChange={(checked) => handleSettingChange('projects', 'requireDescription', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow File Upload</Label>
                    <p className="text-sm text-gray-500">Enable file attachments for projects</p>
                  </div>
                  <Switch
                    checked={settings.projects.allowFileUpload}
                    onCheckedChange={(checked) => handleSettingChange('projects', 'allowFileUpload', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-assign Team Members</Label>
                    <p className="text-sm text-gray-500">Automatically assign team members to tasks</p>
                  </div>
                  <Switch
                    checked={settings.projects.autoAssignTeamMembers}
                    onCheckedChange={(checked) => handleSettingChange('projects', 'autoAssignTeamMembers', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Task Approval</Label>
                    <p className="text-sm text-gray-500">Require approval for task completion</p>
                  </div>
                  <Switch
                    checked={settings.projects.requireTaskApproval}
                    onCheckedChange={(checked) => handleSettingChange('projects', 'requireTaskApproval', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Project Updates</Label>
                    <p className="text-sm text-gray-500">Notify about project changes</p>
                  </div>
                  <Switch
                    checked={settings.notifications.projectUpdates}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'projectUpdates', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Task Assignments</Label>
                    <p className="text-sm text-gray-500">Notify about new task assignments</p>
                  </div>
                  <Switch
                    checked={settings.notifications.taskAssignments}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'taskAssignments', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Budget Alerts</Label>
                    <p className="text-sm text-gray-500">Notify about budget changes</p>
                  </div>
                  <Switch
                    checked={settings.notifications.budgetAlerts}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'budgetAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Deadline Reminders</Label>
                    <p className="text-sm text-gray-500">Notify about upcoming deadlines</p>
                  </div>
                  <Switch
                    checked={settings.notifications.deadlineReminders}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'deadlineReminders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Team Member Requests</Label>
                    <p className="text-sm text-gray-500">Notify about team member join requests</p>
                  </div>
                  <Switch
                    checked={settings.notifications.teamMemberRequests}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'teamMemberRequests', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Project Completion</Label>
                    <p className="text-sm text-gray-500">Notify when projects are completed</p>
                  </div>
                  <Switch
                    checked={settings.notifications.projectCompletion}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'projectCompletion', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Budget Overruns</Label>
                    <p className="text-sm text-gray-500">Notify about budget overruns</p>
                  </div>
                  <Switch
                    checked={settings.notifications.budgetOverruns}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'budgetOverruns', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-gray-500">Receive weekly project reports</p>
                  </div>
                  <Switch
                    checked={settings.notifications.weeklyReports}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'weeklyReports', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Display Settings
              </CardTitle>
              <CardDescription>Configure your interface preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Project ID</Label>
                    <p className="text-sm text-gray-500">Display project ID in project cards</p>
                  </div>
                  <Switch
                    checked={settings.display.showProjectId}
                    onCheckedChange={(checked) => handleSettingChange('display', 'showProjectId', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Creation Date</Label>
                    <p className="text-sm text-gray-500">Display project creation date</p>
                  </div>
                  <Switch
                    checked={settings.display.showCreationDate}
                    onCheckedChange={(checked) => handleSettingChange('display', 'showCreationDate', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Budget</Label>
                    <p className="text-sm text-gray-500">Display project budget</p>
                  </div>
                  <Switch
                    checked={settings.display.showBudget}
                    onCheckedChange={(checked) => handleSettingChange('display', 'showBudget', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Team Members</Label>
                    <p className="text-sm text-gray-500">Display team members in project cards</p>
                  </div>
                  <Switch
                    checked={settings.display.showTeamMembers}
                    onCheckedChange={(checked) => handleSettingChange('display', 'showTeamMembers', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Progress Bar</Label>
                    <p className="text-sm text-gray-500">Display progress bars for projects</p>
                  </div>
                  <Switch
                    checked={settings.display.showProgressBar}
                    onCheckedChange={(checked) => handleSettingChange('display', 'showProgressBar', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact Mode</Label>
                    <p className="text-sm text-gray-500">Use compact layout for lists</p>
                  </div>
                  <Switch
                    checked={settings.display.compactMode}
                    onCheckedChange={(checked) => handleSettingChange('display', 'compactMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Timeline</Label>
                    <p className="text-sm text-gray-500">Display project timeline view</p>
                  </div>
                  <Switch
                    checked={settings.display.showTimeline}
                    onCheckedChange={(checked) => handleSettingChange('display', 'showTimeline', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Management
              </CardTitle>
              <CardDescription>Configure team management settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Team Member Invites</Label>
                    <p className="text-sm text-gray-500">Allow inviting new team members</p>
                  </div>
                  <Switch
                    checked={settings.team.allowTeamMemberInvites}
                    onCheckedChange={(checked) => handleSettingChange('team', 'allowTeamMemberInvites', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Approval for Joining</Label>
                    <p className="text-sm text-gray-500">Require approval when team members want to join</p>
                  </div>
                  <Switch
                    checked={settings.team.requireApprovalForJoining}
                    onCheckedChange={(checked) => handleSettingChange('team', 'requireApprovalForJoining', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Direct Messages</Label>
                    <p className="text-sm text-gray-500">Allow team members to message each other</p>
                  </div>
                  <Switch
                    checked={settings.team.allowDirectMessages}
                    onCheckedChange={(checked) => handleSettingChange('team', 'allowDirectMessages', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Team Member Status</Label>
                    <p className="text-sm text-gray-500">Display online/offline status of team members</p>
                  </div>
                  <Switch
                    checked={settings.team.showTeamMemberStatus}
                    onCheckedChange={(checked) => handleSettingChange('team', 'showTeamMemberStatus', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Team Chat</Label>
                    <p className="text-sm text-gray-500">Enable team chat functionality</p>
                  </div>
                  <Switch
                    checked={settings.team.enableTeamChat}
                    onCheckedChange={(checked) => handleSettingChange('team', 'enableTeamChat', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
