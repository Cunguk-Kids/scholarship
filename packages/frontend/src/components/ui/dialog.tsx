import { useClickOutside } from "@/hooks/useClickOutside";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import type React from "react";
import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { RemoveScroll } from "react-remove-scroll";

gsap.registerPlugin(Draggable, InertiaPlugin);

export function Dialog(props: {
  open?: boolean;
  onOpenChange?: (value: boolean) => unknown;
  children?: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(props.open);
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint.isLessThan("sm");
  const draggableRef = useRef<Draggable | null>(null);
  const isContentAtTop = useRef<boolean>(true);

  useClickOutside(ref, () => {
    if (!isMobile) {
      props.onOpenChange?.(false);
    }
  });

  // Handle content scroll detection
  useEffect(() => {
    if (!contentRef.current || !isMobile || !props.open) return;

    const content = contentRef.current;
    
    const handleScroll = () => {
      isContentAtTop.current = content.scrollTop <= 0;
    };

    // Set initial state
    isContentAtTop.current = true;
    content.addEventListener('scroll', handleScroll);

    return () => {
      content.removeEventListener('scroll', handleScroll);
    };
  }, [props.open, isMobile]);

  useEffect(() => {
    if (props.open && isMobile) {
      setShouldRender(true);

      // Wait for next tick to ensure DOM is ready
      setTimeout(() => {
        if (ref.current && backdropRef.current) {
          // Animate in
          gsap.fromTo(
            ref.current,
            { y: "100%" },
            {
              y: 0,
              duration: 0.3,
              ease: "power2.out",
              onComplete: () => setIsAnimating(true),
            }
          );
          gsap.fromTo(
            backdropRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.3 }
          );

          // Setup draggable with enhanced interactions
          draggableRef.current = Draggable.create(ref.current, {
            type: "y",
            bounds: { minY: 0, maxY: window.innerHeight },
            dragResistance: 0.15, // Reduced for more responsive swipes
            inertia: true,
            trigger: "[data-type='handler'], [data-type='content']", // Drag from handler and content
            edgeResistance: 0.65, // Reduced for easier fast swipes
            allowEventDefault: true,
            // @ts-expect-error idk why this work
            onPress: function(e) {
              // Check if dragging from content area
              const target = e.target as HTMLElement;
              const isContentDrag = target.closest('[data-type="content"]');
              
              // If dragging from content, only allow if at top and dragging down
              if (isContentDrag && contentRef.current) {
                const isAtTop = contentRef.current.scrollTop <= 0;
                if (!isAtTop) {
                  // Disable dragging if content is not at top
                  this.endDrag();
                  return false;
                }
              }
            },
            onDragStart: function (e) {
              const target = (e && e.target) as HTMLElement;
              const isContentDrag = target?.closest('[data-type="content"]');
              
              // If dragging from content area and not at top, cancel drag
              if (isContentDrag && contentRef.current && contentRef.current.scrollTop > 0) {
                this.endDrag();
                return;
              }
              
              // Kill any ongoing animations to prevent conflicts
              gsap.killTweensOf([ref.current, backdropRef.current]);
              // Add visual feedback
              if (ref.current) {
                ref.current.style.transition = "none";
              }
            },
            onDrag: function () {
              const progress = Math.max(
                0,
                Math.min(1, this.y / window.innerHeight)
              );

              // Update backdrop opacity based on drag position
              if (backdropRef.current) {
                gsap.set(backdropRef.current, { opacity: 1 - progress * 0.6 });
              }

              // Add subtle scale effect as user drags down
              if (ref.current) {
                const scale = 1 - progress * 0.02;
                gsap.set(ref.current, { scale });
              }
            },
            onRelease: function () {
              const threshold = window.innerHeight * 0.3;
              const velocity = this.deltaY || 0;
              const velocityThreshold = 20; // Lower threshold for more sensitive fast swipe detection
              // Use InertiaPlugin's velocity if available, otherwise calculate from deltaY
              const swipeSpeed = InertiaPlugin.getVelocity(this.target, "y")
                ? Math.abs(InertiaPlugin.getVelocity(this.target, "y"))
                : Math.abs(velocity * 10);
              const isFlickGesture = swipeSpeed > 800 && this.y > 50; // Detect quick flick gestures
              const isFastSwipe = swipeSpeed > 500 && this.y > 100; // Fast swipe with some distance

              // Reset scale
              if (ref.current) {
                gsap.set(ref.current, { scale: 1 });
              }

              // Determine if should close based on position, velocity, or swipe speed
              // Close if: dragged past threshold, OR fast swipe, OR flick gesture detected
              if (
                this.y > threshold ||
                velocity > velocityThreshold ||
                isFastSwipe ||
                isFlickGesture
              ) {
                // Use faster animation for fast swipes
                const isVeryFastSwipe = swipeSpeed > 1000;
                const closeDuration = isVeryFastSwipe ? 0.15 : 0.25;

                // Close the dialog with smooth animation
                gsap.to(ref.current, {
                  y: window.innerHeight,
                  duration: closeDuration,
                  ease: isVeryFastSwipe ? "power1.in" : "power2.in",
                  onComplete: () => {
                    props.onOpenChange?.(false);
                    if (draggableRef.current) {
                      draggableRef.current.kill();
                    }
                  },
                });
                gsap.to(backdropRef.current, {
                  opacity: 0,
                  duration: closeDuration,
                });
              } else if (this.y < -50) {
                // Snap to top with bounce effect if pulled up
                gsap.to(ref.current, {
                  y: 0,
                  duration: 0.4,
                  ease: "back.out(1.2)",
                });
                gsap.to(backdropRef.current, {
                  opacity: 1,
                  duration: 0.3,
                });
              } else {
                // Snap back to open position with proper animation
                gsap.to(ref.current, {
                  y: 0,
                  duration: 0.35,
                  ease: "power3.out",
                  overwrite: "auto", // Prevent animation conflicts
                });
                gsap.to(backdropRef.current, {
                  opacity: 1,
                  duration: 0.35,
                  overwrite: "auto",
                });
              }
            },
            onClick: function (e) {
              const target = e.target as HTMLElement;
              // Only close on handler click, not drag
              if (
                this.deltaY === 0 &&
                this.deltaX === 0 &&
                target?.getAttribute("data-type") === "handler"
              ) {
                gsap.to(ref.current, {
                  y: window.innerHeight,
                  duration: 0.25,
                  ease: "power2.in",
                  onComplete: () => {
                    props.onOpenChange?.(false);
                    if (draggableRef.current) {
                      draggableRef.current.kill();
                    }
                  },
                });
                gsap.to(backdropRef.current, {
                  opacity: 0,
                  duration: 0.25,
                });
              }
            },
          })[0];
        }
      }, 10);
    } else if (props.open && !isMobile) {
      setShouldRender(true);
      setTimeout(() => setIsAnimating(true), 10);
    } else if (!props.open) {
      if (isMobile && ref.current) {
        gsap.to(ref.current, {
          y: window.innerHeight,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            setShouldRender(false);
            setIsAnimating(false);
          },
        });
        gsap.to(backdropRef.current, {
          opacity: 0,
          duration: 0.3,
        });
      } else {
        setIsAnimating(false);
        setTimeout(() => setShouldRender(false), 300);
      }
    }

    return () => {
      if (draggableRef.current) {
        draggableRef.current.kill();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open, isMobile]);

  const handleBackdropClick = () => {
    props.onOpenChange?.(false);
  };

  if (!shouldRender) return null;

  return createPortal(
    <RemoveScroll enabled={props.open}>
      {isMobile ? (
        <div
          ref={backdropRef}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50"
          onClick={handleBackdropClick}
        >
          <div
            className={`fixed bottom-0 left-0 right-0 rounded-t-[28px] bg-skbw shadow-xl z-50`}
            ref={ref}
            onClick={(e) => e.stopPropagation()}
            style={{
              touchAction: "none",
              willChange: "transform",
              maxHeight: "90svh",
            }}
          >
            {/* Drag handle area */}
            <div
              data-type="handler"
              className="w-full py-2 cursor-grab active:cursor-grabbing"
            >
              <div className="w-12 h-1 bg-gray-400 rounded-full mx-auto hover:bg-gray-500 transition-colors" />
            </div>
            {/* Content area with scrolling */}
            <div
              ref={contentRef}
              data-type="content"
              className={`px-6 pb-8 overflow-y-auto ${props.className ?? ""}`}
              style={{ 
                maxHeight: "calc(90vh - 40px)",
                WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
                overscrollBehavior: "contain" // Prevent scroll chaining
              }}
            >
              {props.children}
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 flex items-center justify-center ${
            isAnimating ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`bg-skbw shadow-md rounded-2xl p-12 ${props.className ?? ""}`}
            ref={ref}
          >
            {props.children}
          </div>
        </div>
      )}
    </RemoveScroll>,
    document.body
  );
}
