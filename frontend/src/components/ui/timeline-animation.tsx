"use client";
import React from "react";
import { motion, type Variants } from "motion/react";

interface TimelineContentProps {
  as?: string | React.ComponentType<any>;
  animationNum?: number;
  timelineRef?: React.RefObject<HTMLDivElement | null>;
  customVariants?: Variants;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export const TimelineContent: React.FC<TimelineContentProps> = ({
  as = "div",
  animationNum = 0,
  timelineRef,
  customVariants,
  className,
  children,
  ...props
}) => {
  const Component = (motion as any)[as as string] || motion.div;

  return (
    <Component
      custom={animationNum}
      variants={customVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
};

export default TimelineContent;
