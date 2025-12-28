"use client"

import React from 'react'
import { Bell, LogOut } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navigation() {
    const pathname = usePathname()
    
    const menuItems = [
      { name: 'Overview', href: '/dashboard' },
      { name: 'Session Insights', href: '/insights' },
      { name: 'Call History', href: '/history' },
      { name: 'Wellness Signals', href: '/signals' },
      { name: 'Growth Tracker', href: '/growth' },
    ]

    return (
      <nav className="flex items-center justify-between px-8 py-4 bg-black/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm rotate-45 flex items-center justify-center">
               <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">SOLACE AI</span>
        </Link>

      {/* Menu */}
      <div className="hidden lg:flex items-center gap-6">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                isActive 
                  ? 'text-white' 
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              {item.name}
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="h-0.5 bg-emerald-500 mt-0.5 rounded-full"
                />
              )}
            </Link>
          )
        })}
      </div>

      {/* Right side icons */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="rounded-full text-neutral-400 hover:text-white hover:bg-white/5 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 border-2 border-black rounded-full" />
        </Button>
        <div className="flex items-center gap-3 pl-2 ml-2 border-l border-white/10">
          <Button 
            variant="ghost" 
            className="text-neutral-400 hover:text-white hover:bg-white/5 flex items-center gap-2"
            onClick={() => {
              // Add logout logic here
              console.log('Logout clicked');
            }}
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}

