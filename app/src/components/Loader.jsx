function Loader() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="relative">
        <div className="absolute inset-0 animate-ping">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 opacity-20"></div>
        </div>
        
        <div className="absolute inset-0 animate-pulse">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20"></div>
        </div>

        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute w-full h-full">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-lg animate-[orbit_2s_linear_infinite]"></div>
          </div>
          
          <div className="absolute w-full h-full rotate-45">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full shadow-lg animate-[orbit_2s_linear_infinite_0.5s]"></div>
          </div>
          
          <div className="absolute w-full h-full rotate-90">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-gradient-to-r from-pink-500 to-red-600 rounded-full shadow-lg animate-[orbit_2s_linear_infinite_1s]"></div>
          </div>
          
          <div className="absolute w-full h-full rotate-[135deg]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full shadow-lg animate-[orbit_2s_linear_infinite_1.5s]"></div>
          </div>

          <div className="w-20 h-20 bg-white rounded-full shadow-2xl flex items-center justify-center animate-pulse">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full animate-spin-slow shadow-inner"></div>
          </div>
        </div>

        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div className="flex flex-col items-center gap-2">
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 font-bold text-lg animate-pulse">
              Loading
            </p>
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0s' }}></span>
              <span className="w-2.5 h-2.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.15s' }}></span>
              <span className="w-2.5 h-2.5 bg-gradient-to-r from-pink-500 to-red-600 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.3s' }}></span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes orbit {
          0% {
            transform: translateX(-50%) translateY(0) rotate(0deg);
          }
          100% {
            transform: translateX(-50%) translateY(0) rotate(360deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default Loader;