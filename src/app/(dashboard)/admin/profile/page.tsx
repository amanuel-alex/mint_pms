'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import UserPreferences from '@/components/UserPreferences';

const profileSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  email: z.string().email('Invalid email address'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Current password must be at least 6 characters'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function ProfileSettings() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch admin profile on mount
  useEffect(() => {
    setLoading(true);
    fetch('/api/users/me')
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setProfile(data.user);
        resetProfile({
          name: data.user.fullName,
          email: data.user.email,
        });
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Profile state
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: isSubmittingProfile },
  } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile,
  });

  // Password state
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
  } = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
  });

  // Image preview
  const [preview, setPreview] = useState<string | null>(null);

  // Password visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size exceeds 2MB');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmitProfile = async (data: z.infer<typeof profileSchema>) => {
    setSaving(true);
    setError(null);
    let imageUrl = profile?.profileImageUrl;
    try {
      if (selectedFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        const res = await fetch('/api/users/me/profile-image', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        const imgData = await res.json();
        if (!res.ok) throw new Error(imgData.error || 'Failed to upload image');
        imageUrl = imgData.url;
        
        // Force refresh the profile data to get the updated image
        const profileRes = await fetch('/api/users/me');
        const profileData = await profileRes.json();
        if (profileRes.ok) {
          setProfile(profileData.user);
        }
        
        setPreview(null); // Clear preview since we now have the actual URL
        setSelectedFile(null);
        toast.success('Profile image updated!');
        setUploading(false);
      }
      
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.name,
          email: data.email,
          profileImageUrl: imageUrl,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to update profile');
      setProfile(result.user);
      toast.success('Profile updated!');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      setUploading(false);
    } finally {
      setSaving(false);
    }
  };

  const onSubmitPassword = async (data: z.infer<typeof passwordSchema>) => {
    try {
      const response = await fetch('/api/users/me/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to change password');
      }

      toast.success('🔒 Password updated successfully!');
      resetPassword();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-[100vh] bg-gradient-to-br from-[#f8fafc] to-[#e0f2fe] flex items-center justify-center py-10">
      <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-2xl mx-auto relative"
        >
          {/* Loading overlay spinner */}
          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 rounded-2xl">
              <Loader2 className="animate-spin w-10 h-10 text-[#087684]" />
            </div>
          )}
          {/* Error message */}
          {error && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 bg-red-100 text-red-700 px-4 py-2 rounded shadow text-sm">
              {error}
            </div>
          )}
          <Card className={cn("p-10 shadow-2xl rounded-2xl bg-white/90 flex flex-col gap-10 items-center relative", loading && 'pointer-events-none opacity-70')}> 
        {/* Header */}
            <div className="w-full flex flex-col items-center gap-2 mb-2">
              <h1 className="text-4xl font-extrabold tracking-tight text-[#087684] flex items-center gap-3">
                <span>Admin Profile</span>
                <span className="bg-[#FB923C] text-white px-4 py-1 rounded-full text-sm font-semibold shadow">{profile?.role}</span>
              </h1>
              <p className="text-muted-foreground text-base mt-1 text-center max-w-md">
            Manage your profile and personal preferences.
          </p>
            </div>
            {/* Profile Card */}
            <form onSubmit={handleProfileSubmit(onSubmitProfile)} className="w-full flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="flex flex-col items-center gap-3 w-full md:w-1/3">
                <div className="relative">
                  <Avatar 
                    className="w-32 h-32 ring-4 ring-[#FB923C] ring-offset-2 shadow-lg" 
                    key={`${profile?.profileImageUrl}-${Date.now()}`}
                  >
                    <AvatarImage 
                      src={preview || (profile?.profileImageUrl ? `${profile.profileImageUrl}?v=${Date.now()}` : undefined)} 
                      alt={profile?.fullName || 'Admin'}
                    />
                    <AvatarFallback>
                      {profile?.fullName?.split(' ').map((n: string) => n[0]).join('') || 'Admin'}
                    </AvatarFallback>
                  </Avatar>
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-full">
                      <Loader2 className="animate-spin w-10 h-10 text-[#087684]" />
                    </div>
                  )}
                </div>
                <Label htmlFor="photo" className="text-sm font-medium">Profile Photo</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-1"
                  disabled={uploading}
                />
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG. Max size 2MB.</p>
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div>
                  <Label className="text-xs text-gray-500">Full Name</Label>
                  <Input id="name" {...registerProfile('name')} placeholder="John Doe" className="mt-1" />
              {profileErrors.name && (
                <p className="text-sm text-red-500 mt-1">{profileErrors.name.message}</p>
              )}
            </div>
            <div>
                  <Label className="text-xs text-gray-500">Email Address</Label>
                  <Input id="email" type="email" {...registerProfile('email')} placeholder="you@example.com" className="mt-1" />
              {profileErrors.email && (
                <p className="text-sm text-red-500 mt-1">{profileErrors.email.message}</p>
              )}
            </div>
                <div>
                  <Label className="text-xs text-gray-500">Role</Label>
                  <div className="font-semibold text-[#087684] mt-1">{profile?.role}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Member Since</Label>
                  <div className="text-gray-700 mt-1">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : ''}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Last Updated</Label>
                  <div className="text-gray-700 mt-1">{profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : ''}</div>
                </div>
                <div className="col-span-2 flex gap-4 mt-4">
                  <Button type="submit" className="flex-1 h-11 text-base flex items-center justify-center gap-2" disabled={saving}>
                    {saving && <Loader2 className="animate-spin w-5 h-5" />}
                    {saving ? 'Saving...' : 'Save Changes'}
              </Button>
                  <Button type="button" variant="outline" className="flex-1 h-11 text-base" onClick={() => resetProfile(profile)} disabled={saving}>
                Cancel
              </Button>
                </div>
            </div>
          </form>
        {/* Password Change Form */}
            <Card className="p-6 space-y-6 shadow-lg rounded-2xl bg-background w-full max-w-xl mx-auto">
          <form onSubmit={handlePasswordSubmit(onSubmitPassword)} className="space-y-6">
            <h2 className="text-2xl font-semibold">Change Password</h2>
                <div>
              <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type={showCurrent ? 'text' : 'password'} {...registerPassword('currentPassword')} placeholder="••••••••" className="mt-1" />
              {passwordErrors.currentPassword && (
                    <p className="text-sm text-red-500 mt-1">{passwordErrors.currentPassword.message}</p>
              )}
            </div>
                <div>
              <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type={showNew ? 'text' : 'password'} {...registerPassword('newPassword')} placeholder="••••••••" className="mt-1" />
              {passwordErrors.newPassword && (
                    <p className="text-sm text-red-500 mt-1">{passwordErrors.newPassword.message}</p>
              )}
            </div>
                <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type={showConfirm ? 'text' : 'password'} {...registerPassword('confirmPassword')} placeholder="••••••••" className="mt-1" />
              {passwordErrors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>
            <div className="flex gap-4">
                  <Button type="submit" className="flex-1 h-11 text-base" disabled={isSubmittingPassword}>
                    {isSubmittingPassword ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : null}
                    {isSubmittingPassword ? 'Saving...' : 'Change Password'}
              </Button>
                  <Button type="button" variant="outline" className="flex-1 h-11 text-base" onClick={() => resetPassword()} disabled={isSubmittingPassword}>
                Cancel
              </Button>
            </div>
          </form>
            </Card>
        </Card>
      </motion.div>
      </div>
    </>
  );
}
