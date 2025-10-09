import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Login from "./Login";
import Register from "./Register";

export default function AuthPage() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-600 to-gray-300 flex items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2 transform rotate-20">
          <div className="absolute w-full h-[70px] bg-blue-400/20 top-[0%]"></div>
          <div className="absolute w-full h-[80px] bg-white/40 top-[20%]"></div>
          <div className="absolute w-full h-[80px] bg-white/40 top-[40%]"></div>
          <div className="absolute w-full h-[80px] bg-white/40 top-[60%]"></div>
          <div className="absolute w-full h-[70px] bg-blue-400/20 top-[80%]"></div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-5xl h-[560px] flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {showLogin ? (
            <motion.div
              key="login"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="w-full"
            >
              <Login switchForm={() => setShowLogin(false)} />
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="w-full"
            >
              <Register switchForm={() => setShowLogin(true)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
