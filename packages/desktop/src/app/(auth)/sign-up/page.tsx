'use client';

import { type FC, useState } from 'react';
import Link from 'next/link';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const SignUpPage: FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !password || !confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
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
                <FiUser className="h-6 w-6" />
              </div>
            </div>
            <h1 className="text-center text-2xl font-bold">Create account</h1>
            <p className="text-base-content/60 mb-4 text-center text-sm">
              Join us and get started
            </p>

            {error && (
              <div className="alert alert-error mb-4 text-sm">{error}</div>
            )}

            {submitted ? (
              <div className="alert alert-success text-sm">
                Account created successfully.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="form-control">
                  <label className="label" htmlFor="name">
                    <span className="label-text">Full name</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control">
                  <label className="label" htmlFor="signup-email">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control">
                  <label className="label" htmlFor="signup-password">
                    <span className="label-text">Password</span>
                  </label>
                  <div className="relative">
                    <input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
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
                <div className="form-control">
                  <label className="label" htmlFor="confirm">
                    <span className="label-text">Confirm password</span>
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat your password"
                    className="input input-bordered w-full"
                  />
                </div>
                <button type="submit" className="btn btn-primary mt-2 w-full">
                  Create account
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-base-content/60 mt-6 text-center text-sm">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
};

export default SignUpPage;
