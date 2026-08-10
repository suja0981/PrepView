import { type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";

// ── Shared easing curve — subtle, professional, not bouncy ──────────────
const ease = [0.25, 0.1, 0.25, 1] as const;

// ── Fade + lift (default entry animation for cards, sections) ───────────
const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export function FadeIn({
  children,
  delay = 0,
  duration = 0.4,
  className,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      variants={fadeUpVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Scale in (for hero elements, badges) ────────────────────────────────
export function ScaleIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Stagger container (wraps children that each animate sequentially) ───
export function StaggerContainer({
  children,
  stagger = 0.06,
  className,
}: {
  children: ReactNode;
  stagger?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      transition={{ staggerChildren: stagger }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Stagger item (child of StaggerContainer) ────────────────────────────
export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={fadeUpVariants}
      transition={{ duration: 0.35, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Animated counter (for stat numbers that count up) ───────────────────
export function AnimatedNumber({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {value}{suffix}
      </motion.span>
    </motion.span>
  );
}
