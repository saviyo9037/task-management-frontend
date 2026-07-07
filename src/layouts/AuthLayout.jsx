import { Outlet } from 'react-router-dom';
import { CheckSquare } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="relative flex min-h-dvh overflow-hidden bg-app">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] h-[70vh] w-[70vh] rounded-full bg-accent-muted-t opacity-70 blur-[100px] mix-blend-multiply" />
        <div className="absolute top-[20%] -right-[10%] h-[60vh] w-[60vh] rounded-full bg-accent-t opacity-20 blur-[120px] mix-blend-multiply" />
        <div className="absolute -bottom-[20%] left-[20%] h-[80vh] w-[80vh] rounded-full bg-blue-500/10 blur-[120px] mix-blend-multiply" />
      </div>

      <div className="relative z-10 flex w-full flex-col lg:flex-row">
        <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 xl:p-16">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-t shadow-premium-sm">
              <CheckSquare className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-primary-t">TaskFlow</span>
          </div>

          <div className="space-y-8">
            <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight text-primary-t xl:text-6xl">
              Manage your work<br />
              <span className="text-accent-t">beautifully.</span>
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-secondary-t">
              A premium workspace engineered for modern teams. Organize, collaborate, and execute with unparalleled speed and clarity.
            </p>

            <div className="flex gap-10 pt-4">
              {[
                { label: 'Tasks Completed', value: '10M+' },
                { label: 'Active Teams', value: '50k+' },
                { label: 'System Uptime', value: '99.99%' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-3xl font-bold tracking-tight text-primary-t">{s.value}</p>
                  <p className="mt-1 text-sm font-medium text-secondary-t">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm font-medium text-sidebar-muted-t">© 2026 TaskFlow Inc. All rights reserved.</p>
        </div>

        <div
          className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-12 lg:px-20 xl:px-32"
          style={{
            paddingTop: 'max(3rem, env(safe-area-inset-top))',
            paddingBottom: 'max(3rem, env(safe-area-inset-bottom))',
          }}
        >

          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-t shadow-premium-sm">
              <CheckSquare className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary-t">TaskFlow</span>
          </div>

          <div className="w-full max-w-[440px] rounded-[2rem] bg-card-t/60 p-8 shadow-premium backdrop-blur-2xl ring-1 ring-border-t-color sm:p-10">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
