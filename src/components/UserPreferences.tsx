'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Palette, Shield, Save, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface UserPreferences {
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    projectUpdates: boolean;
    taskAssignments: boolean;
    deadlineReminders: boolean;
    weeklyDigest: boolean;
  };
  display: {
    theme: string;
    compactMode: boolean;
    showProgressBars: boolean;
    showTimestamps: boolean;
  };
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
    allowDirectMessages: boolean;
    showOnlineStatus: boolean;
  };
}

interface UserPreferencesProps {
  role: string;
}

export default function UserPreferences({ role }: UserPreferencesProps) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      projectUpdates: true,
      taskAssignments: true,
      deadlineReminders: true,
      weeklyDigest: false,
    },
    display: {
      theme: 'light',
      compactMode: false,
      showProgressBars: true,
      showTimestamps: true,
    },
    privacy: {
      showEmail: false,
      showPhone: false,
      allowDirectMessages: true,
      showOnlineStatus: true,
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch('/api/users/me/preferences');
        if (response.ok) {
          const data = await response.json();
          setPreferences(data.preferences);
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
        toast.error('Failed to load preferences');
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handlePreferenceChange = (section: keyof UserPreferences, key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/users/me/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      toast.success('Preferences saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPreferences({
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        projectUpdates: true,
        taskAssignments: true,
        deadlineReminders: true,
        weeklyDigest: false,
      },
      display: {
        theme: 'light',
        compactMode: false,
        showProgressBars: true,
        showTimestamps: true,
      },
      privacy: {
        showEmail: false,
        showPhone: false,
        allowDirectMessages: true,
        showOnlineStatus: true,
      }
    });
    setHasChanges(false);
    toast.success('Preferences reset to defaults');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Preferences</h2>
          <p className="text-sm text-gray-500">Customize your {role.toLowerCase()} experience</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleReset} disabled={saving}>
            Reset to Defaults
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="bg-gray-600 hover:bg-gray-700"
          >
            {saving ? (
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
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <span className="text-blue-800 text-sm">You have unsaved changes</span>
        </div>
      )}

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="display" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Display
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.emailNotifications}
                    onCheckedChange={(checked) => handlePreferenceChange('notifications', 'emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-gray-500">Receive browser push notifications</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.pushNotifications}
                    onCheckedChange={(checked) => handlePreferenceChange('notifications', 'pushNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Project Updates</Label>
                    <p className="text-sm text-gray-500">Notify about project changes</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.projectUpdates}
                    onCheckedChange={(checked) => handlePreferenceChange('notifications', 'projectUpdates', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Task Assignments</Label>
                    <p className="text-sm text-gray-500">Notify about new task assignments</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.taskAssignments}
                    onCheckedChange={(checked) => handlePreferenceChange('notifications', 'taskAssignments', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Deadline Reminders</Label>
                    <p className="text-sm text-gray-500">Notify about upcoming deadlines</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.deadlineReminders}
                    onCheckedChange={(checked) => handlePreferenceChange('notifications', 'deadlineReminders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Digest</Label>
                    <p className="text-sm text-gray-500">Receive weekly summary emails</p>
                  </div>
                  <Switch
                    checked={preferences.notifications.weeklyDigest}
                    onCheckedChange={(checked) => handlePreferenceChange('notifications', 'weeklyDigest', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display">
          <Card>
            <CardHeader>
              <CardTitle>Display Preferences</CardTitle>
              <CardDescription>Customize your interface appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select
                  value={preferences.display.theme}
                  onValueChange={(value) => handlePreferenceChange('display', 'theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact Mode</Label>
                    <p className="text-sm text-gray-500">Use compact layout</p>
                  </div>
                  <Switch
                    checked={preferences.display.compactMode}
                    onCheckedChange={(checked) => handlePreferenceChange('display', 'compactMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Progress Bars</Label>
                    <p className="text-sm text-gray-500">Display progress indicators</p>
                  </div>
                  <Switch
                    checked={preferences.display.showProgressBars}
                    onCheckedChange={(checked) => handlePreferenceChange('display', 'showProgressBars', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Timestamps</Label>
                    <p className="text-sm text-gray-500">Display time information</p>
                  </div>
                  <Switch
                    checked={preferences.display.showTimestamps}
                    onCheckedChange={(checked) => handlePreferenceChange('display', 'showTimestamps', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control your privacy and visibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Email</Label>
                    <p className="text-sm text-gray-500">Allow others to see your email</p>
                  </div>
                  <Switch
                    checked={preferences.privacy.showEmail}
                    onCheckedChange={(checked) => handlePreferenceChange('privacy', 'showEmail', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Phone</Label>
                    <p className="text-sm text-gray-500">Allow others to see your phone</p>
                  </div>
                  <Switch
                    checked={preferences.privacy.showPhone}
                    onCheckedChange={(checked) => handlePreferenceChange('privacy', 'showPhone', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Direct Messages</Label>
                    <p className="text-sm text-gray-500">Allow team members to message you</p>
                  </div>
                  <Switch
                    checked={preferences.privacy.allowDirectMessages}
                    onCheckedChange={(checked) => handlePreferenceChange('privacy', 'allowDirectMessages', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Online Status</Label>
                    <p className="text-sm text-gray-500">Show when you're online</p>
                  </div>
                  <Switch
                    checked={preferences.privacy.showOnlineStatus}
                    onCheckedChange={(checked) => handlePreferenceChange('privacy', 'showOnlineStatus', checked)}
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