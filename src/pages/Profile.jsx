import { useQuery, useMutation } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { User, Mail, Lock, Loader2, Camera, KeyRound, ShieldCheck } from 'lucide-react';
import { getProfile, updateProfile } from '@/services/authApi';
import { changePassword } from '@/services/passwordApi';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '@/redux/slices/authSlice';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

const Profile = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      dispatch(setCredentials(data));
      toast.success('Profile updated successfully');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const profileFormik = useFormik({
    enableReinitialize: true,
    initialValues: { name: profile?.name || '', email: profile?.email || '' },
    validationSchema: Yup.object({
      name: Yup.string().min(2).required('Name is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
    }),
    onSubmit: (values) => updateMutation.mutate(values),
  });

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully');
      passwordFormik.resetForm();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to change password'),
  });

  const passwordFormik = useFormik({
    initialValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
    validationSchema: Yup.object({
      oldPassword: Yup.string().required('Current password is required'),
      newPassword: Yup.string().min(6, 'At least 6 characters').required('New password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Passwords do not match')
        .required('Please confirm your new password'),
    }),
    onSubmit: ({ oldPassword, newPassword }) => passwordMutation.mutate({ oldPassword, newPassword }),
  });

  const initials = profile?.name
    ? profile.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const inputClass = (formik, field) =>
    `input-base pl-11 ${
      formik.touched[field] && formik.errors[field] ? 'input-error' : ''
    }`;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-primary-t">Profile Settings</h1>
        <p className="mt-1 text-sm font-medium text-secondary-t">Manage your account information and security</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Avatar Card */}
        <div className="premium-card p-8 flex flex-col items-center text-center">
          {isLoading ? (
            <Skeleton className="h-28 w-28 rounded-full" />
          ) : (
            <div className="relative group">
              <Avatar className="h-28 w-28 border-4 border-card-t shadow-premium-sm transition-transform duration-300 group-hover:scale-105">
                <AvatarFallback className="bg-accent-t text-white text-3xl font-black">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-card-t shadow-premium ring-1 ring-border-t-color cursor-pointer transition-transform hover:scale-110">
                <Camera className="h-4 w-4 text-accent-t" />
              </div>
            </div>
          )}
          <div className="mt-5 space-y-2 w-full">
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-4 w-40 mx-auto" />
              </>
            ) : (
              <>
                <p className="text-xl font-bold tracking-tight text-primary-t">{profile?.name}</p>
                <p className="text-sm font-medium text-secondary-t break-all">{profile?.email}</p>
                <div className="mt-3 inline-flex items-center rounded-full bg-accent-muted-t px-4 py-1.5 text-xs font-bold text-accent-t">
                  {userInfo?.role || 'User'}
                </div>
              </>
            )}
          </div>

          <Separator className="my-8 bg-border-t-color/50" />

          <div className="w-full text-left space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-sidebar-muted-t">Account Security</p>
            <div className="flex items-center gap-4 text-sm font-medium rounded-xl p-3 bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20">
              <ShieldCheck className="h-5 w-5" />
              <span>Account is active</span>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium rounded-xl p-3 bg-accent-muted-t text-accent-t ring-1 ring-accent-t/20">
              <KeyRound className="h-5 w-5" />
              <span>Password protected</span>
            </div>
          </div>
        </div>

        {/* Right Column: Profile + Password forms */}
        <div className="col-span-2 space-y-6">
          {/* Edit Profile */}
          <div className="premium-card p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-bold tracking-tight text-primary-t">Personal Information</h2>
              <p className="text-sm font-medium text-secondary-t mt-1">Update your name and email address</p>
            </div>

            {isLoading ? (
              <div className="space-y-5">
                {[1, 2].map((i) => <Skeleton key={i} className="h-12 w-full rounded-2xl" />)}
              </div>
            ) : (
              <form onSubmit={profileFormik.handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-secondary-t">Full Name</label>
                  <div className="relative">
                    <p className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sidebar-muted-t mr-5"/>
                    <input
                      type="text"
                      {...profileFormik.getFieldProps('name')}
                      className={inputClass(profileFormik, 'name')}
                    />
                  </div>
                  {profileFormik.touched.name && profileFormik.errors.name && (
                    <p className="mt-1.5 text-xs font-semibold text-red-500">{profileFormik.errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-secondary-t">Email Address</label>
                  <div className="relative">
                    <p className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sidebar-muted-t" />
                    <input
                      type="email"
                      {...profileFormik.getFieldProps('email')}
                      className={inputClass(profileFormik, 'email')}
                    />
                  </div>
                  {profileFormik.touched.email && profileFormik.errors.email && (
                    <p className="mt-1.5 text-xs font-semibold text-red-500">{profileFormik.errors.email}</p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={updateMutation.isLoading || !profileFormik.dirty}
                    className="btn-primary w-full sm:w-auto"
                  >
                    {updateMutation.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="premium-card p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-bold tracking-tight text-primary-t">Change Password</h2>
              <p className="text-sm font-medium text-secondary-t mt-1">Ensure your account is using a long, random password</p>
            </div>

            <form onSubmit={passwordFormik.handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-secondary-t">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sidebar-muted-t" />
                  <input
                    type="password"
                    {...passwordFormik.getFieldProps('oldPassword')}
                    className={inputClass(passwordFormik, 'oldPassword')}
                  />
                </div>
                {passwordFormik.touched.oldPassword && passwordFormik.errors.oldPassword && (
                  <p className="mt-1.5 text-xs font-semibold text-red-500">{passwordFormik.errors.oldPassword}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-secondary-t">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sidebar-muted-t" />
                  <input
                    type="password"
                    {...passwordFormik.getFieldProps('newPassword')}
                    className={inputClass(passwordFormik, 'newPassword')}
                  />
                </div>
                {passwordFormik.touched.newPassword && passwordFormik.errors.newPassword && (
                  <p className="mt-1.5 text-xs font-semibold text-red-500">{passwordFormik.errors.newPassword}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-secondary-t">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sidebar-muted-t" />
                  <input
                    type="password"
                    {...passwordFormik.getFieldProps('confirmPassword')}
                    className={inputClass(passwordFormik, 'confirmPassword')}
                  />
                </div>
                {passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword && (
                  <p className="mt-1.5 text-xs font-semibold text-red-500">{passwordFormik.errors.confirmPassword}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passwordMutation.isLoading || !passwordFormik.dirty}
                  className="btn-primary w-full sm:w-auto"
                >
                  {passwordMutation.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
