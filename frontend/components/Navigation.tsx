"use client"

import React, { useEffect, useState } from 'react'
import { Bell, LogOut } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { removeToken, getToken, getCurrentUser } from '@/lib/api'
import type { User } from '@/lib/api'

export function Navigation() {
    const pathname = usePathname()
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    
    useEffect(() => {
      const fetchUser = async () => {
        const token = getToken()
        if (token) {
          try {
            const userData = await getCurrentUser(token)
            setUser(userData)
          } catch (error) {
            console.error('Failed to fetch user:', error)
          }
        }
      }
      fetchUser()
    }, [])
    
    const menuItems = user?.role === 'admin' 
      ? [
          { name: 'Dashboard', href: '/dashboard' },
          { name: 'Reports', href: '/history' },
        ]
      : [
          { name: 'Welcome', href: '/welcome' },
          { name: 'My Check-ins', href: '/my-checkins' },
        ]

    const handleLogout = () => {
      removeToken()
      router.push('/login')
    }

    return (
      <nav className="flex items-center justify-between px-8 py-4 bg-black/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
        {}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm rotate-45 flex items-center justify-center">
               <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Solace-AI</span>
        </Link>

      {}
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

               {}
               <div className="flex items-center gap-2">
                 <Button 
                   variant="ghost" 
                   size="icon" 
                   className="rounded-full text-neutral-400 hover:text-white hover:bg-white/5 relative"
                 >
                   <Bell className="w-5 h-5" />
                   <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 border-2 border-black rounded-full" />
                 </Button>
                 <Button
                   onClick={handleLogout}
                   variant="ghost"
                   size="icon"
                   className="rounded-full text-neutral-400 hover:text-white hover:bg-white/5"
                   title="Logout"
                 >
                   <LogOut className="w-5 h-5" />
                 </Button>
               </div>
    </nav>
  )
}

