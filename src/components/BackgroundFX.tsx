'use client';

import { motion } from 'framer-motion';

export default function BackgroundFX() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* malha/grade sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.06),transparent_60%)]" />
      {/* blobs animados */}
      <motion.div
        initial={{ x: -200, y: -120, scale: 0.8, opacity: 0.5 }}
        animate={{ x: 80, y: -60, scale: 1, opacity: 0.6 }}
        transition={{ duration: 12, repeat: Infinity, repeatType: 'reverse' }}
        className="absolute h-[40vmax] w-[40vmax] rounded-full blur-3xl bg-[#2563EB]/20 top-[-10%] left-[-10%]"
      />
      <motion.div
        initial={{ x: 200, y: 140, scale: 0.8, opacity: 0.4 }}
        animate={{ x: -60, y: 80, scale: 1, opacity: 0.5 }}
        transition={{ duration: 14, repeat: Infinity, repeatType: 'reverse' }}
        className="absolute h-[38vmax] w-[38vmax] rounded-full blur-3xl bg-[#06B6D4]/20 bottom-[-15%] right-[-10%]"
      />
      {/* vinheta escura para dar profundidade */}
      <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_50%,transparent,rgba(0,0,0,0.55))]" />
    </div>
  );
}
