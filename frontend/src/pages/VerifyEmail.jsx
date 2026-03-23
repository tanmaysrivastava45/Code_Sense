import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, MailCheck, XCircle } from 'lucide-react';
import { apiClient } from '../config/supabaseClient';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Verification link is missing a token.');
        return;
      }

      try {
        const response = await apiClient.auth.verifyEmail(token);

        if (response.error) {
          setStatus('error');
          setMessage(response.error);
          return;
        }

        setStatus('success');
        setMessage(response.message || 'Email verified successfully.');
      } catch (error) {
        setStatus('error');
        setMessage(error.message || 'Email verification failed.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg glass-effect rounded-2xl p-8 shadow-2xl text-center">
        <div className="flex justify-center mb-6">
          {status === 'loading' && <MailCheck className="text-cyan-400" size={52} />}
          {status === 'success' && <CheckCircle className="text-green-400" size={52} />}
          {status === 'error' && <XCircle className="text-red-400" size={52} />}
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">Email Verification</h1>
        <p
          className={`mb-8 ${
            status === 'success'
              ? 'text-green-300'
              : status === 'error'
                ? 'text-red-300'
                : 'text-gray-300'
          }`}
        >
          {message}
        </p>

        <Link
          to="/login"
          className="inline-flex items-center justify-center px-6 py-3 gradient-primary text-white rounded-lg font-semibold shadow-lg hover:shadow-cyan-500/50 transition-all"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmail;
