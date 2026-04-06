import { type ComponentType, type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PremiumButtonProps {
  variant?: 'primary' | 'secondary' | 'gold' | 'earth';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: ComponentType<{ className?: string }>;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  children: ReactNode;
}

export function PremiumButton({
  variant = 'primary',
  size = 'lg',
  icon: Icon,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  children,
}: PremiumButtonProps) {
  const variants = {
    primary: `
      bg-gradient-to-br from-[#4CC9F0] to-[#4361EE]
      hover:from-[#72EFDD] hover:to-[#4895EF]
      active:from-[#4361EE] active:to-[#3A0CA3]
      shadow-[0_8px_24px_rgba(76,201,240,0.4)]
      hover:shadow-[0_12px_32px_rgba(76,201,240,0.5)]
      border border-white/20
    `,
    secondary: `
      bg-gradient-to-br from-white/15 to-white/5
      hover:from-white/25 hover:to-white/10
      active:from-white/10 active:to-white/5
      shadow-[0_4px_16px_rgba(0,0,0,0.3)]
      border border-white/30
    `,
    gold: `
      bg-gradient-to-br from-[#72EFDD] to-[#4CC9F0]
      hover:from-[#98F5E1] hover:to-[#56CFE1]
      active:from-[#4CC9F0] active:to-[#4895EF]
      shadow-[0_8px_24px_rgba(76,201,240,0.4)]
      text-[#0B1026]
    `,
    earth: `
      bg-gradient-to-br from-[#3A0CA3] to-[#4361EE]
      hover:from-[#5A189A] hover:to-[#4895EF]
      active:from-[#3A0CA3] active:to-[#240046]
      shadow-[0_8px_24px_rgba(67,97,238,0.45)]
      text-white
    `,
  };

  const sizes = {
    sm: 'h-12 px-6 text-base gap-2',
    md: 'h-14 px-8 text-lg gap-2.5',
    lg: 'h-16 px-10 text-xl gap-3',
    xl: 'h-20 px-12 text-2xl gap-4',
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: disabled ? 1 : 0.95, y: 0, transition: { duration: 0.1 } }}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-2xl
        font-bold
        flex items-center justify-center
        transition-all duration-300
        disabled:opacity-50
        disabled:cursor-not-allowed
        relative
        overflow-hidden
        ${className}
      `}
      type={type}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="absolute w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
        />
      )}
      <span className={`flex items-center justify-center ${loading ? 'invisible' : ''}`}>
        {Icon && <Icon className="w-6 h-6" />}
        {children}
      </span>
    </motion.button>
  );
}

interface GlassCardProps {
  children: ReactNode;
  variant?: 'default' | 'premium' | 'dark';
  className?: string;
}

export function GlassCard({ children, variant = 'default', className = '', ...props }: GlassCardProps) {
  const variants = {
    default: `
      bg-white/10
      backdrop-blur-xl
      border border-white/20
      shadow-[0_8px_32px_rgba(0,0,0,0.4)]
    `,
    premium: `
      bg-gradient-to-br from-white/15 to-white/5
      backdrop-blur-2xl
      border border-white/30
      shadow-[0_12px_48px_rgba(0,0,0,0.5)]
    `,
    dark: `
      bg-black/40
      backdrop-blur-xl
      border border-white/10
      shadow-[0_8px_32px_rgba(0,0,0,0.6)]
    `,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${variants[variant]} rounded-3xl p-8 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  icon?: ComponentType<{ className?: string }>;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, icon: Icon, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className={`glass-card-premium w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}
      >
        {(title || Icon) && (
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
            {Icon && (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4CC9F0] to-[#4361EE] flex items-center justify-center">
                <Icon className="w-6 h-6 text-[#EAF4FF]" />
              </div>
            )}
            <h2 className="text-3xl font-black text-white text-premium">{title}</h2>
            <button
              onClick={onClose}
              className="ml-auto w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div>{children}</div>
      </motion.div>
    </motion.div>
  );
}

interface StatCardProps {
  icon?: ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtext?: string;
  color?: 'gold' | 'pink' | 'green' | 'blue';
  className?: string;
}

export function StatCard({ icon: Icon, label, value, subtext, color = 'gold', className = '' }: StatCardProps) {
  const colors = {
    gold: 'from-[#4CC9F0] to-[#4361EE]',
    pink: 'from-[#72EFDD] to-[#4CC9F0]',
    green: 'from-[#4ADE80] to-[#22C55E]',
    blue: 'from-[#3498db] to-[#2980b9]',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      className={`bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center ${className}`}
    >
      {Icon && (
        <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      )}
      <div className="text-3xl md:text-4xl font-black text-white mb-1">{value}</div>
      <div className="text-sm text-white/70 font-medium">{label}</div>
      {subtext && <div className="text-xs text-white/50 mt-1">{subtext}</div>}
    </motion.div>
  );
}

interface AchievementCardProps {
  achievement: {
    unlocked: boolean;
    icon: string;
    name: string;
    description: string;
    progress: number;
    requirement: number;
  };
  className?: string;
}

export function AchievementCard({ achievement, className = '' }: AchievementCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-4 rounded-2xl border-2 transition-all ${achievement.unlocked ? 'border-[#4CC9F0] bg-[#4CC9F0]/10 shadow-[0_0_24px_rgba(76,201,240,0.25)]' : 'border-white/20 bg-white/5 opacity-60'} ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-4xl">{achievement.icon}</span>
        <div className="flex-1">
          <div className="font-bold text-white text-lg">{achievement.name}</div>
          <div className="text-sm text-white/70 mt-1">{achievement.description}</div>
          {!achievement.unlocked && (
            <div className="mt-3">
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (achievement.progress / achievement.requirement) * 100)}%` }}
                  className="bg-gradient-to-r from-[#4CC9F0] to-[#4361EE] h-2 rounded-full transition-all"
                />
              </div>
              <div className="text-xs text-white/50 mt-1 text-right">
                {achievement.progress} / {achievement.requirement}
              </div>
            </div>
          )}
        </div>
        {achievement.unlocked && <span className="text-2xl">✅</span>}
      </div>
    </motion.div>
  );
}

interface ToggleProps {
  enabled: boolean;
  onToggle: (next: boolean) => void;
  label?: string;
  className?: string;
}

export function Toggle({ enabled, onToggle, label, className = '' }: ToggleProps) {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      {label && <span className="text-white font-medium">{label}</span>}
      <button
        onClick={() => onToggle(!enabled)}
        className={`w-14 h-8 rounded-full transition-all duration-300 ${enabled ? 'bg-[#4CC9F0]' : 'bg-white/20'} relative`}
      >
        <motion.div animate={{ x: enabled ? 24 : 4 }} className="w-6 h-6 bg-white rounded-full absolute top-1 shadow-md" />
      </button>
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'gold' | 'success' | 'error';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-white/10 text-white border-white/20',
    gold: 'bg-[#4CC9F0]/20 text-[#4CC9F0] border-[#4CC9F0]/30',
    success: 'bg-[#22C55E]/20 text-[#4ADE80] border-[#22C55E]/30',
    error: 'bg-[#EF4444]/20 text-[#F87171] border-[#EF4444]/30',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
