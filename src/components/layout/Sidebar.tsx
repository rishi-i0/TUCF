import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Briefcase, 
  FileText, 
  Globe, 
  Map, 
  Settings,
  FilePenLine,
  Target,
  Milestone,
  Bot,
  ScrollText,
} from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
}

const menuItems = [
  { path: '/dashboard', icon: Home, label: 'Dashboard' },
  { path: '/jobs', icon: Briefcase, label: 'Job Search' },
  { path: '/ats', icon: FileText, label: 'ATS Scoring' },
  { path: '/portfolio', icon: Globe, label: 'Portfolio' },
  { path: '/roadmaps', icon: Map, label: 'Roadmaps' },
  { path: '/cover-letter', icon: FilePenLine, label: 'Cover Letter Generator' },
  { path: '/interview-prep', icon: Target, label: 'Interview Prep' },
  { path: '/roadmap-generator', icon: Milestone, label: 'Roadmap Generator' },
  { path: '/resume-builder', icon: ScrollText, label: 'Resume Builder' },
  { path: '/ai-assistant', icon: Bot, label: 'AI Assistant' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const location = useLocation();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                title={item.label}
              >
                <Icon className="sidebar-icon" />
                {isOpen && (
                  <span className="sidebar-label">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
