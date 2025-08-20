import React, { useState, useRef, type ReactNode } from 'react';
import { usePopper } from 'react-popper';

interface HoverPopoverProps {
  trigger: ReactNode;
  content: ReactNode;
  className?: string;
}

const HoverPopover: React.FC<HoverPopoverProps> = ({ trigger, content, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const { styles, attributes } = usePopper(triggerRef.current, popoverRef.current, {
    placement: 'right',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 8],
        },
      },
    ],
  });

  const handleMouseEnter = () => setIsOpen(true);
  const handleMouseLeave = () => setIsOpen(false);

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      <div ref={triggerRef}>{trigger}</div>
      <div
        ref={popoverRef}
        style={{
          ...styles.popper,
          visibility: isOpen ? 'visible' : 'hidden',
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        {...attributes.popper}
        className="bg-white border border-gray-200 rounded-md shadow-md p-2 text-xs z-20 w-[200px]">
        {content}
      </div>
    </div>
  );
};

export default HoverPopover;
