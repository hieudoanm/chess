'use client';

import { type FC, useState } from 'react';
import Link from 'next/link';
import { FiMail, FiKey } from 'react-icons/fi';

const ForgetPasswordPage: FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    if (!email.trim()) {
      setError('Enter your email address.');
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
                <FiKey className="h-6 w-6" />
              </div>
            </div>
            <h1 className="text-center text-2xl font-bold">Forgot password</h1>
            <p className="text-base-content/60 mb-4 text-center text-sm">
              We&apos;ll email you a link to reset your password
            </p>

            {error && (
              <div className="alert alert-error mb-4 text-sm">{error}</div>
            )}

            {submitted ? (
              <div className="alert alert-success text-sm">
                If that email exists, a reset link has been sent.
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
                <button type="submit" className="btn btn-primary mt-2 w-full">
                  Send reset link
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-base-content/60 mt-6 text-center text-sm">
          Remembered it?{' '}
          <Link href="/sign-in" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
};

export default ForgetPasswordPage;
