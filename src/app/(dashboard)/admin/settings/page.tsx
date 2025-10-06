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
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Building2,
  Save,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Zap,
  Shield,
  FileText,
  DollarSign,
  Users,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface Settings {
  projects: {
    defaultStatus: string;
    defaultBudget: string;
    requireDescription: boolean;
    allowFileUpload: boolean;
    allowedFileTypes: string[];
    maxFileSize: number;
    autoAssignProjectManager: boolean;
    requireBudgetApproval: boolean;
  };
  notifications: {
    projectUpdates: boolean;
    taskAssignments: boolean;
    budgetAlerts: boolean;
    deadlineReminders: boolean;
    newUserRegistration: boolean;
    projectCompletion: boolean;
    budgetOverruns: boolean;
    systemMaintenance: boolean;
  };
  display: {
    showProjectId: boolean;
    showCreationDate: boolean;
    showBudget: boolean;
    showHolder: boolean;
    showTeamMembers: boolean;
    showProgressBar: boolean;
    compactMode: boolean;
    darkMode: boolean;
  };
  system: {
    allowUserRegistration: boolean;
    requireEmailVerification: boolean;
    maxProjectsPerUser: number;
    maxTeamMembersPerProject: number;
    sessionTimeout: number;
    backupFrequency: string;
    enableAuditLog: boolean;
  };
}

export default function AdminSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>({
    projects: {
      defaultStatus: 'PLANNED',
      defaultBudget: '0',
      requireDescription: false,
      allowFileUpload: true,
      allowedFileTypes: ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.png'],
      maxFileSize: 5,
      autoAssignProjectManager: false,
      requireBudgetApproval: true,
    },
    notifications: {
      projectUpdates: true,
      taskAssignments: true,
      budgetAlerts: true,
      deadlineReminders: true,
      newUserRegistration: true,
      projectCompletion: true,
      budgetOverruns: true,
      systemMaintenance: false,
    },
    display: {
      showProjectId: true,
      showCreationDate: true,
      showBudget: true,
      showHolder: true,
      showTeamMembers: true,
      showProgressBar: true,
      compactMode: false,
      darkMode: false,
    },
    system: {
      allowUserRegistration: true,
      requireEmailVerification: true,
      maxProjectsPerUser: 10,
      maxTeamMembersPerProject: 20,
      sessionTimeout: 24,
      backupFrequency: 'daily',
      enableAuditLog: true,
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // First check if user is authenticated and is admin
        const authResponse = await fetch('/api/users/me');
        if (authResponse.ok) {
          const authData = await authResponse.json();
          setUserRole(authData.user.role);
          
          if (authData.user.role !== 'ADMIN') {
            toast.error('Access denied. Admin privileges required.');
            setIsLoading(false);
            return;
          }
        } else {
          toast.error('Please log in to access settings.');
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data.settings);
        } else {
          toast.error('Failed to load settings');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSettingChange = (section: keyof Settings, key: string, value: any) => {
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
      console.log('Saving settings:', settings);
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      });

      console.log('Response status:', response.status);
      
      const result = await response.json();
      console.log('Response result:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save settings');
      }

      toast.success('Settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({
      projects: {
        defaultStatus: 'PLANNED',
        defaultBudget: '0',
        requireDescription: false,
        allowFileUpload: true,
        allowedFileTypes: ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.png'],
        maxFileSize: 5,
        autoAssignProjectManager: false,
        requireBudgetApproval: true,
      },
      notifications: {
        projectUpdates: true,
        taskAssignments: true,
        budgetAlerts: true,
        deadlineReminders: true,
        newUserRegistration: true,
        projectCompletion: true,
        budgetOverruns: true,
        systemMaintenance: false,
      },
      display: {
        showProjectId: true,
        showCreationDate: true,
        showBudget: true,
        showHolder: true,
        showTeamMembers: true,
        showProgressBar: true,
        compactMode: false,
        darkMode: false,
      },
      system: {
        allowUserRegistration: true,
        requireEmailVerification: true,
        maxProjectsPerUser: 10,
        maxTeamMembersPerProject: 20,
        sessionTimeout: 24,
        backupFrequency: 'daily',
        enableAuditLog: true,
      }
    });
    setHasChanges(false);
    toast.success('Settings reset to defaults');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="text-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600 mx-auto"></div>
            <Settings className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-sm text-slate-600 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (userRole && userRole !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h2>
              <p className="text-slate-600">Admin privileges are required to access settings.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">System Settings</h1>
                  <p className="text-slate-600">Configure project management preferences</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline"
                onClick={handleReset}
                disabled={isSaving}
                className="border-slate-300 hover:bg-slate-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset to Defaults
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
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
        </div>

        {/* Changes Indicator */}
        {hasChanges && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex items-center gap-2">
              <span className="text-amber-800 font-medium">Unsaved changes detected</span>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                <Zap className="w-3 h-3 mr-1" />
                Auto-save disabled
              </Badge>
            </div>
          </div>
        )}

        {/* Settings Cards */}
        <div className="space-y-8">
          {/* Project Settings Card */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-900">Project Settings</CardTitle>
                  <CardDescription className="text-slate-600">Configure default project settings and requirements</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Basic Settings Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Default Project Status
                  </Label>
                  <Select
                    value={settings.projects.defaultStatus}
                    onValueChange={(value) => handleSettingChange('projects', 'defaultStatus', value)}
                  >
                    <SelectTrigger className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select default status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLANNED">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Planned
                        </div>
                      </SelectItem>
                      <SelectItem value="ACTIVE">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Active
                        </div>
                      </SelectItem>
                      <SelectItem value="COMPLETED">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          Completed
                        </div>
                      </SelectItem>
                      <SelectItem value="CANCELLED">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Cancelled
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Default Budget (USD)
                  </Label>
                  <Input
                    type="number"
                    value={settings.projects.defaultBudget}
                    onChange={(e) => handleSettingChange('projects', 'defaultBudget', e.target.value)}
                    placeholder="Enter default budget"
                    className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="my-6 border-t border-slate-200"></div>

              {/* Advanced Settings Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Max File Size (MB)
                  </Label>
                  <Input
                    type="number"
                    value={settings.projects.maxFileSize}
                    onChange={(e) => handleSettingChange('projects', 'maxFileSize', parseInt(e.target.value))}
                    placeholder="5"
                    className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Backup Frequency
                  </Label>
                  <Select
                    value={settings.system.backupFrequency}
                    onValueChange={(value) => handleSettingChange('system', 'backupFrequency', value)}
                  >
                    <SelectTrigger className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="my-6 border-t border-slate-200"></div>

              {/* Toggle Settings */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-slate-600" />
                  Project Requirements
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-slate-700">Require Description</Label>
                        <p className="text-xs text-slate-500">Make project description mandatory</p>
                      </div>
                      <Switch
                        checked={settings.projects.requireDescription}
                        onCheckedChange={(checked) => handleSettingChange('projects', 'requireDescription', checked)}
                        className="data-[state=checked]:bg-blue-600"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-slate-700">Allow File Upload</Label>
                        <p className="text-xs text-slate-500">Enable file attachments for projects</p>
                      </div>
                      <Switch
                        checked={settings.projects.allowFileUpload}
                        onCheckedChange={(checked) => handleSettingChange('projects', 'allowFileUpload', checked)}
                        className="data-[state=checked]:bg-blue-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-slate-700">Auto-assign Project Manager</Label>
                        <p className="text-xs text-slate-500">Automatically assign project manager to new projects</p>
                      </div>
                      <Switch
                        checked={settings.projects.autoAssignProjectManager}
                        onCheckedChange={(checked) => handleSettingChange('projects', 'autoAssignProjectManager', checked)}
                        className="data-[state=checked]:bg-blue-600"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-slate-700">Require Budget Approval</Label>
                        <p className="text-xs text-slate-500">Require admin approval for budget changes</p>
                      </div>
                      <Switch
                        checked={settings.projects.requireBudgetApproval}
                        onCheckedChange={(checked) => handleSettingChange('projects', 'requireBudgetApproval', checked)}
                        className="data-[state=checked]:bg-blue-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
