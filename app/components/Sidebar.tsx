'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Award, 
  Compass, 
  Users, 
  MessageSquare, 
  HelpCircle, 
  MoreHorizontal,
  ChevronDown 
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  title: string;
  icon: any;
  href?: string;
  subItems?: { title: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    title: 'My Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    title: 'My Certifications',
    icon: Award,
    href: '/certifications',
  },
  {
    title: 'Explore',
    icon: Compass,
    subItems: [
      { title: 'Hackathons', href: '/' },
      { title: 'Project Archive', href: '/projects' },
    ],
  },
  {
    title: 'Community',
    icon: Users,
    subItems: [
      { title: 'Events', href: '/events' },
      { title: 'Discussions', href: '/discussions' },
      { title: 'Support', href: '/support' },
    ],
  },
  {
    title: 'More',
    icon: MoreHorizontal,
    subItems: [
      { title: 'About', href: '/about' },
      { title: 'Resources', href: '/resources' },
      { title: 'FAQ', href: '/faq' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Explore']);

  const toggleExpand = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 min-h-screen fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">H</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">HackChain</h1>
            <p className="text-gray-400 text-xs">Build. Compete. Win.</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedItems.includes(item.title);
          const hasSubItems = item.subItems && item.subItems.length > 0;

          return (
            <div key={item.title}>
              {hasSubItems ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.title)}
                    className="w-full flex items-center justify-between px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 group-hover:text-blue-400 transition" />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                {isExpanded && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.subItems?.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`block px-4 py-2 text-sm rounded-lg transition ${
                            pathname === subItem.href
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                          }`}
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href || '#'}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition group ${
                    pathname === item.href
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition ${
                      pathname === item.href
                        ? 'text-white'
                        : 'group-hover:text-blue-400'
                    }`}
                  />
                  <span className="font-medium">{item.title}</span>
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-4 text-white">
          <h3 className="font-semibold mb-1">Go Pro</h3>
          <p className="text-xs text-blue-100 mb-3">
            Unlock premium features and priority support
          </p>
          <button className="w-full bg-white text-blue-600 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition">
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  );
}
