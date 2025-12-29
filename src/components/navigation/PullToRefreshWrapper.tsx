import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
}

const PULL_THRESHOLD = 60;
const MAX_PULL = 130;

export function PullToRefreshWrapper({ onRefresh, children }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const y = useMotionValue(0);
  
  const rotate = useTransform(y, [0, PULL_THRESHOLD], [0, 180]);
  const opacity = useTransform(y, [0, 20, PULL_THRESHOLD], [0, 0, 1]);
  const scale = useTransform(y, [0, PULL_THRESHOLD], [0, 1]);
  
  const translateY = useTransform(y, (latest) => latest / 2 - 20);

  useEffect(() => {
    const checkMobile = () => {
      // Consider mobile if width < 768px (md breakpoint)
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) return;

      const handleTouchStart = (e: TouchEvent) => {
      const isScrollLocked = document.body.hasAttribute("data-scroll-locked");
      const isSwipeActive = document.body.hasAttribute("data-swipe-active");
      const isInsideDialog = (e.target as Element)?.closest?.('[role="dialog"]');
      
      if (window.scrollY > 0 || isRefreshing || isScrollLocked || isSwipeActive || isInsideDialog) return;
      
      
      const startY = e.touches[0].clientY;

      // Ignore touches on fixed header (approx 80px)
      if (startY < 80) return;

      const handleTouchMove = (e: TouchEvent) => {
        if (document.body.hasAttribute("data-scroll-locked") || document.body.hasAttribute("data-swipe-active")) {
           y.set(0); 
           return;
        }

        const currentY = e.touches[0].clientY;
        const diff = currentY - startY;

        if (diff > 0 && window.scrollY <= 0) {
          const resistance = Math.min(diff * 0.8, MAX_PULL);
          
          if (resistance > 0) {
            if (e.cancelable) {
               // Only prevent default if we are actually pulling to refresh
               // and not just scrolling up (handled by window.scrollY check)
               // But standard behavior might conflict? 
               // Van360 implementation does `e.preventDefault()` here.
               e.preventDefault(); 
            }
            y.set(resistance);
          }
        }
      };

      const handleTouchEnd = async () => {
        const currentY = y.get();
        cleanupListeners();

        if (currentY >= PULL_THRESHOLD) {
          setIsRefreshing(true);
          animate(y, PULL_THRESHOLD, { type: "spring", stiffness: 300, damping: 30 });
          
          try {
            await onRefresh();
          } finally {
            setIsRefreshing(false);
            animate(y, 0, { type: "spring", stiffness: 300, damping: 30 });
          }
        } else {
          animate(y, 0, { type: "spring", stiffness: 300, damping: 30 });
        }
      };

      const cleanupListeners = () => {
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
        document.removeEventListener("touchcancel", handleTouchEnd);
      };

      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleTouchEnd);
      document.addEventListener("touchcancel", handleTouchEnd);
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
    };
  }, [isRefreshing, onRefresh, y, isMobile]);

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen">
      <motion.div
        className="absolute top-0 left-0 right-0 z-10 flex justify-center items-start pointer-events-none"
        style={{ y: translateY, opacity, scale }}
      >
        <div className="p-2 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center">
          <motion.div
            style={{ rotate }}
            animate={isRefreshing ? { rotate: 360 } : {}}
            transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : {}}
          >
            <Loader2 className={`w-6 h-6 ${isRefreshing ? "text-primary" : "text-gray-400"}`} />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        style={{ y }}
        className="w-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
