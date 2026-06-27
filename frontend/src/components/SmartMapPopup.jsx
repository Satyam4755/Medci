import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useMap } from './ui/map';

const SmartMapPopup = ({ longitude, latitude, children, onClose, offset = 16, className = "" }) => {
  const { map } = useMap();
  const popupRef = useRef(null);
  
  const [position, setPosition] = useState({ x: -9999, y: -9999, anchor: 'bottom', isReady: false });

  useEffect(() => {
    if (!map) return;

    let reqId;

    const updatePosition = () => {
      if (!popupRef.current) return;
      
      const pt = map.project([longitude, latitude]);
      
      const container = map.getContainer();
      const mapWidth = container.clientWidth;
      const mapHeight = container.clientHeight;
      
      const popupWidth = popupRef.current.offsetWidth;
      const popupHeight = popupRef.current.offsetHeight;
      
      const spaceAbove = pt.y;
      const spaceBelow = mapHeight - pt.y;
      const spaceLeft = pt.x;
      const spaceRight = mapWidth - pt.x;

      let finalX = pt.x;
      let finalY = pt.y;
      let anchor = 'bottom';
      
      // Case 1 & 2: Vertical Positioning
      if (spaceAbove >= popupHeight + offset) {
         finalY = pt.y - popupHeight - offset;
         anchor = 'bottom';
      } else if (spaceBelow >= popupHeight + offset) {
         finalY = pt.y + offset;
         anchor = 'top';
      } else {
         finalY = pt.y - popupHeight - offset;
         anchor = 'bottom';
      }

      // Case 3 & 4: Horizontal Positioning (Clamping)
      const halfWidth = popupWidth / 2;
      const edgePadding = 12; // Safety margin
      
      if (spaceLeft < halfWidth + edgePadding) {
         finalX = (popupWidth / 2) + edgePadding; 
      } else if (spaceRight < halfWidth + edgePadding) {
         finalX = mapWidth - (popupWidth / 2) - edgePadding;
      } else {
         finalX = pt.x;
      }

      setPosition({ x: finalX, y: finalY, anchor, isReady: true });
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(reqId);
      reqId = requestAnimationFrame(updatePosition);
    };

    updatePosition();
    
    map.on('move', scheduleUpdate);
    map.on('zoom', scheduleUpdate);
    map.on('pitch', scheduleUpdate);
    
    let ro, mapRo;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(() => scheduleUpdate());
      if (popupRef.current) ro.observe(popupRef.current);
      
      mapRo = new ResizeObserver(() => scheduleUpdate());
      mapRo.observe(map.getContainer());
    }

    return () => {
      cancelAnimationFrame(reqId);
      map.off('move', scheduleUpdate);
      map.off('zoom', scheduleUpdate);
      map.off('pitch', scheduleUpdate);
      if (ro) ro.disconnect();
      if (mapRo) mapRo.disconnect();
    };
  }, [map, longitude, latitude, offset]);

  if (!map) return null;

  const popupVariants = {
    hidden: { opacity: 0, scale: 0.9, y: position.anchor === 'bottom' ? 10 : -10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] } },
    exit: { opacity: 0, scale: 0.95, y: position.anchor === 'bottom' ? 5 : -5, transition: { duration: 0.15, ease: 'easeIn' } }
  };

  return createPortal(
    <div 
      className="absolute z-50 pointer-events-none"
      style={{ left: position.x, top: position.y, transform: 'translate(-50%, 0)' }}
    >
      <motion.div
        ref={popupRef}
        variants={popupVariants}
        initial="hidden"
        animate={position.isReady ? "visible" : "hidden"}
        exit="exit"
        className={`pointer-events-auto relative ${className}`}
        style={{ visibility: position.isReady ? 'visible' : 'hidden' }}
      >
        {onClose && (
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-2 right-2 bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 rounded-full p-1 z-10 transition-colors"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        )}
        {children}
      </motion.div>
    </div>,
    map.getContainer()
  );
};

export default SmartMapPopup;
