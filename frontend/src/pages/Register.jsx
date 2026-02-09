// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { supabase } from '../config/supabaseClient';
// import { Code, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';

// const Register = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [name, setName] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     if (password.length < 6) {
//       setError('Password must be at least 6 characters');
//       setLoading(false);
//       return;
//     }

//     try {
//       const { error } = await supabase.auth.signUp({
//         email,
//         password,
//         options: {
//           data: {
//             name: name
//           }
//         }
//       });

//       if (error) throw error;
//       alert('Registration successful! You can now login.');
//       navigate('/login');
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
//               <h3 className="text-xl font-semibold text-white mb-2">🚀 Analyze Code Complexity</h3>
//               <p className="text-gray-400">Get instant Big O notation for time and space complexity</p>
//             </div>
//             <div className="glass-effect rounded-xl p-6">
//               <h3 className="text-xl font-semibold text-white mb-2">🔍 Find Syntax Errors</h3>
//               <p className="text-gray-400">Detect and fix syntax issues in your code</p>
//             </div>
//             <div className="glass-effect rounded-xl p-6">
//               <h3 className="text-xl font-semibold text-white mb-2">💡 Get Improvements</h3>
//               <p className="text-gray-400">Receive AI-powered suggestions to optimize your code</p>
//             </div>
//             <div className="glass-effect rounded-xl p-6">
//               <h3 className="text-xl font-semibold text-white mb-2">📊 Track History</h3>
//               <p className="text-gray-400">Save and revisit your previous analyses</p>
//             </div>
//           </div>
//         </div>

//         {/* Right Side - Form */}
//         <div className="glass-effect rounded-2xl p-8 shadow-2xl">
//           <div className="text-center mb-8">
//             <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
//             <p className="text-gray-400">Start analyzing your code with AI</p>
//           </div>

//           {error && (
//             <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleRegister} className="space-y-5">
//             <div>
//               <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
//               <div className="relative">
//                 <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                 <input
//                   type="text"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
//                   placeholder="John Doe"
//                   required
//                 />
//               </div>
//             </div>

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
//                   minLength={6}
//                 />
//               </div>
//               <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
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
//                   <span>Create Account</span>
//                   <ArrowRight size={18} />
//                 </>
//               )}
//             </button>
//           </form>

//           <div className="mt-6 text-center">
//             <p className="text-gray-400">
//               Already have an account?{' '}
//               <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
//                 Login here
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

// export default Register;
// ... existing imports
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../config/supabaseClient';
import { Code, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.auth.register(name, email, password);

      if (response.error) {
        setError(response.error);
        return;
      }

      setSuccess(true);
      alert('Registration successful! Please login with your credentials.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setError(error.message || 'Registration failed');
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
               <h3 className="text-xl font-semibold text-white mb-2">🚀 Analyze Code Complexity</h3>
               <p className="text-gray-400">Get instant Big O notation for time and space complexity</p>
             </div>
             <div className="glass-effect rounded-xl p-6">
               <h3 className="text-xl font-semibold text-white mb-2">🔍 Find Syntax Errors</h3>
               <p className="text-gray-400">Detect and fix syntax issues in your code</p>
             </div>
             <div className="glass-effect rounded-xl p-6">
               <h3 className="text-xl font-semibold text-white mb-2">💡 Get Improvements</h3>
               <p className="text-gray-400">Receive AI-powered suggestions to optimize your code</p>
             </div>
             <div className="glass-effect rounded-xl p-6">
               <h3 className="text-xl font-semibold text-white mb-2">📊 Track History</h3>
               <p className="text-gray-400">Save and revisit your previous analyses</p>
             </div>
           </div>
         </div>
        {/* Right Side - Form */}
        <div className="glass-effect rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-gray-400">Start analyzing your code with AI</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm">
              Registration successful! Redirecting to login...
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            {/* ... existing form fields ... */}
          <div>
               <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
               <div className="relative">
                 <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                 <input
                   type="text"
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                   className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                   placeholder="John Doe"
                   required
                 />
               </div>
             </div>

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
               <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
               <div className="relative">
                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                 <input
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                   placeholder="••••••••"
                   required
                   minLength={6}
                 />
               </div>
               <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
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
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                Login here
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

export default Register;
