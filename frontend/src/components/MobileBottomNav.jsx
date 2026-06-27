import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getNavLinksByRole } from '../config/navigation';
import { motion } from 'framer-motion';

const MobileBottomNav = () => {
  const { user } = useContext(AuthContext);
  
  if (!user) return null;
  
  const links = getNavLinksByRole(user.role);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full z-50 glass-panel border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe overflow-x-auto no-scrollbar">
      <nav className="flex justify-start sm:justify-around items-center px-2 py-2 min-w-max sm:min-w-0">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) => 
              `relative flex flex-col items-center justify-center min-w-[4.5rem] px-2 h-14 rounded-xl transition-all mx-0.5 group ${
                isActive 
                  ? 'text-primary-foreground [&_*]:text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:[&_*]:text-foreground'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute inset-0 bg-primary rounded-xl -z-10 shadow-md"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <link.icon size={22} className="mb-1 transition-colors" />
                <span className="text-[10px] font-bold leading-tight truncate w-full text-center">{link.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default MobileBottomNav;
