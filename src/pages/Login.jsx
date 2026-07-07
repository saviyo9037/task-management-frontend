import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { login as loginApi } from '@/services/authApi';
import { setCredentials } from '@/redux/slices/authSlice';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const mutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      dispatch(setCredentials(data));
      toast.success('Welcome back!');
      navigate('/dashboard');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    },
  });

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: (values) => mutation.mutate(values),
  });

  const inputClass = (field) =>
    `input-base pl-11 ${
      formik.touched[field] && formik.errors[field] ? 'input-error' : ''
    }`;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-primary-t">Sign in</h2>
        <p className="mt-2 text-sm text-secondary-t">Welcome back! Please enter your details.</p>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-secondary-t">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-muted-t" />
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...formik.getFieldProps('email')}
              className={inputClass('email')}
            />
          </div>
          {formik.touched.email && formik.errors.email && (
            <p className="mt-1.5 text-xs text-red-500">{formik.errors.email}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-secondary-t">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-muted-t" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter the password"
              {...formik.getFieldProps('password')}
              className={`${inputClass('password')} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sidebar-muted-t hover:text-secondary-t"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className="mt-1.5 text-xs text-red-500">{formik.errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:bg-violet-700 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-secondary-t">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-violet-600 hover:text-violet-700 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
};

export default Login;

