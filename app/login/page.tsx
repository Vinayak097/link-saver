import LoginForm from '@/components/auth/LoginForm';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Login | Link Saver',
  description: 'Login to your Link Saver account',
};

// Create a loading fallback component
function LoginFormLoading() {
  return <div className="p-6 bg-white rounded-lg shadow-md">Loading login form...</div>;
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Suspense fallback={<LoginFormLoading />}>
        <LoginForm />
        <div>
          <p>demo</p>
          <p>email : hello@gmail.com</p>
          <p>password: hellopass</p>
        </div>
      </Suspense>
    </div>
  );
}
