'use client';

import { type FC, useState } from 'react';
import Link from 'next/link';
import { FiUser, FiMail, FiLogIn, FiCamera, FiCheck } from 'react-icons/fi';

const ProfilePage: FC = () => {
  const [name, setName] = useState('Alex Johnson');
  const [email, setEmail] = useState('alex@example.com');
  const [saved, setSaved] = useState(false);

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="bg-base-200 flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card bg-base-100 w-full shadow-xl">
          <div className="card-body">
            <div className="mb-2 flex items-center justify-center">
              <div className="relative">
                <div className="text-primary bg-primary/10 flex h-20 w-20 items-center justify-center rounded-full">
                  <FiUser className="h-10 w-10" />
                </div>
                <button
                  type="button"
                  aria-label="Change photo"
                  className="btn btn-ghost btn-sm absolute -right-1 -bottom-1 rounded-full">
                  <FiCamera className="h-4 w-4" />
                </button>
              </div>
            </div>
            <h1 className="text-center text-2xl font-bold">Profile</h1>
            <p className="text-base-content/60 mb-4 text-center text-sm">
              Manage your account details
            </p>

            {saved && (
              <div className="alert alert-success mb-4 text-sm">
                <FiCheck className="h-4 w-4" />
                Changes saved.
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="form-control">
                <label className="label" htmlFor="profile-name">
                  <span className="label-text">Full name</span>
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="form-control">
                <label className="label" htmlFor="profile-email">
                  <span className="label-text">Email</span>
                </label>
                <div className="relative">
                  <FiMail className="text-base-content/40 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input input-bordered w-full pl-9"
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary mt-2 w-full">
                Save changes
              </button>
            </form>
          </div>
        </div>

        <p className="text-base-content/60 mt-6 text-center text-sm">
          <Link href="/sign-in" className="text-primary hover:underline">
            <FiLogIn className="mr-1 inline h-3.5 w-3.5" />
            Sign out
          </Link>
        </p>
      </div>
    </main>
  );
};

export default ProfilePage;
