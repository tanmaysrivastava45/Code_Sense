// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { supabase } from '../config/supabaseClient';
// import { Code, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const { error } = await supabase.auth.signInWithPassword({
//         email,
//         password
//       });

//       if (error) throw error;
//       navigate('/home');
//     } catch (error) {
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center px-4 py-12">
//       <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
//         {/* Left Side - Branding */}
//         <div className="hidden md:block space-y-6">
//           <div className="flex items-center gap-3">
//             <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl">
//               <Code className="text-white" size={48} />
//             </div>
//             <div>
//               <h1 className="text-4xl font-bold text-white">CodeSense</h1>
//               <p className="text-cyan-400 flex items-center gap-2 mt-1">
//                 <Sparkles size={16} />
//                 AI-Powered Code Analysis
//               </p>
//             </div>
//           </div>
          
//           <div className="space-y-4 mt-12">
//             <div className="glass-effect rounded-xl p-6">
//               <h3 className="text-xl font-semibold text-white mb-2">⚡ Lightning Fast</h3>
//               <p className="text-gray-400">Get instant analysis results powered by Gemini 2.5 Flash</p>
//             </div>
//             <div className="glass-effect rounded-xl p-6">
//               <h3 className="text-xl font-semibold text-white mb-2">🎯 Accurate Analysis</h3>
//               <p className="text-gray-400">Industry-standard complexity calculations and insights</p>
//             </div>
//             <div className="glass-effect rounded-xl p-6">
//               <h3 className="text-xl font-semibold text-white mb-2">🔒 Secure & Private</h3>
//               <p className="text-gray-400">Your code and analysis history are completely secure</p>
//             </div>
//             <div className="glass-effect rounded-xl p-6">
//               <h3 className="text-xl font-semibold text-white mb-2">📈 Learn & Improve</h3>
//               <p className="text-gray-400">Get actionable tips to write better code</p>
//             </div>
//           </div>
//         </div>

//         {/* Right Side - Form */}
//         <div className="glass-effect rounded-2xl p-8 shadow-2xl">
//           <div className="text-center mb-8">
//             <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
//             <p className="text-gray-400">Login to continue analyzing your code</p>
//           </div>

//           {error && (
//             <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleLogin} className="space-y-5">
//             <div>
//               <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
//                   placeholder="your@email.com"
//                   required
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                 <input
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
//                   placeholder="••••••••"
//                   required
//                 />
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 gradient-primary text-white rounded-lg font-semibold shadow-lg hover:shadow-cyan-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
//             >
//               {loading ? (
//                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//               ) : (
//                 <>
//                   <span>Login</span>
//                   <ArrowRight size={18} />
//                 </>
//               )}
//             </button>
//           </form>

//           <div className="mt-6 text-center">
//             <p className="text-gray-400">
//               Don't have an account?{' '}
//               <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
//                 Register here
//               </Link>
//             </p>
//           </div>

//           <div className="mt-6 pt-6 border-t border-gray-700">
//             <p className="text-xs text-center text-gray-500">
//               Powered by Google Gemini 2.5 Flash
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;
// ... existing imports
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../config/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Code, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.auth.login(email, password);
      
      if (response.error) {
        setError(response.error);
        return;
      }

      if (!response.token) {
        setError('No token received from server');
        return;
      }

      // Store token and user info
      login(response.token, response.sessionId, response.user);
      navigate('/home');
    } catch (error) {
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        {/* ... existing branding code ... */}
          <div className="hidden md:block space-y-6">
           <div className="flex items-center gap-3">
             <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl">
               <Code className="text-white" size={48} />
             </div>
             <div>
               <h1 className="text-4xl font-bold text-white">CodeSense</h1>
               <p className="text-cyan-400 flex items-center gap-2 mt-1">
                 <Sparkles size={16} />
                 AI-Powered Code Analysis
               </p>
             </div>
           </div>
          
           <div className="space-y-4 mt-12">
             <div className="glass-effect rounded-xl p-6">
               <h3 className="text-xl font-semibold text-white mb-2">⚡ Lightning Fast</h3>
               <p className="text-gray-400">Get instant analysis results powered by Gemini 2.5 Flash</p>
             </div>
             <div className="glass-effect rounded-xl p-6">
               <h3 className="text-xl font-semibold text-white mb-2">🎯 Accurate Analysis</h3>
               <p className="text-gray-400">Industry-standard complexity calculations and insights</p>
             </div>
             <div className="glass-effect rounded-xl p-6">
               <h3 className="text-xl font-semibold text-white mb-2">🔒 Secure & Private</h3>
               <p className="text-gray-400">Your code and analysis history are completely secure</p>
             </div>
             <div className="glass-effect rounded-xl p-6">
               <h3 className="text-xl font-semibold text-white mb-2">📈 Learn & Improve</h3>
               <p className="text-gray-400">Get actionable tips to write better code</p>
             </div>
           </div>
         </div>
        {/* Right Side - Form */}
        <div className="glass-effect rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400">Login to continue analyzing your code</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">Password</label>
                <Link 
                  to="/forgot-password" 
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 gradient-primary text-white rounded-lg font-semibold shadow-lg hover:shadow-cyan-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                Register here
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-xs text-center text-gray-500">
              Powered by Google Gemini 2.5 Flash
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
