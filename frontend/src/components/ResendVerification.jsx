import { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { apiClient } from '../config/supabaseClient';

const ResendVerification = ({ email }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResendVerification = async () => {
    if (!email) {
      setError('Enter your email first.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await apiClient.auth.resendVerification(email);

      if (response.error) {
        setError(response.error);
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (requestError) {
      setError(requestError.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
      <div className="flex items-start gap-3">
        <Mail className="text-yellow-400 mt-0.5" size={20} />
        <div className="flex-1">
          <p className="text-yellow-200 text-sm mb-2">
            Haven't received the verification email?
          </p>
          
          {success ? (
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle size={16} />
              <span>Verification email sent! Check your inbox.</span>
            </div>
          ) : (
            <>
              {error && (
                <p className="text-red-300 text-xs mb-2">{error}</p>
              )}
              <button
                onClick={handleResendVerification}
                disabled={loading}
                className="text-sm text-yellow-400 hover:text-yellow-300 underline disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Resend verification email'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResendVerification;
