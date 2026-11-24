'use client';

import { type FC, useState } from 'react';
import Link from 'next/link';
import { FiLock, FiMail, FiEye, FiEyeOff } from 'react-icons/fi';

const SignInPage: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <main className="bg-base-200 flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="card bg-base-100 w-full shadow-xl">
          <div className="card-body">
            <div className="mb-2 flex items-center justify-center">
              <div className="bg-primary/10 text-primary flex h-14 w-14 items-center justify-center rounded-2xl">
                <FiLock className="h-6 w-6" />
              </div>
            </div>
            <h1 className="text-center text-2xl font-bold">Sign in</h1>
            <p className="text-base-content/60 mb-4 text-center text-sm">
              Welcome back to your account
            </p>

            {error && (
              <div className="alert alert-error mb-4 text-sm">{error}</div>
            )}

            {submitted ? (
              <div className="alert alert-success text-sm">
                Signed in successfully.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="form-control">
                  <label className="label" htmlFor="email">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control">
                  <label className="label" htmlFor="password">
                    <span className="label-text">Password</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="input input-bordered w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      className="text-base-content/40 hover:text-base-content absolute top-1/2 right-3 -translate-y-1/2">
                      {showPassword ? (
                        <FiEyeOff className="h-5 w-5" />
                      ) : (
                        <FiEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" className="checkbox checkbox-sm" />
                    <span className="text-base-content/60 text-sm">
                      Remember me
                    </span>
                  </label>
                  <Link
                    href="/forget-password"
                    className="text-primary text-sm hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <button type="submit" className="btn btn-primary mt-2 w-full">
                  Sign in
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-base-content/60 mt-6 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
};

export default SignInPage;
