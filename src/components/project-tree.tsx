import { useState, useRef } from 'react'
import { Plus, Minus, Home, Cloud, MessageSquare, Calendar, Settings, CreditCard, Users, Activity, Clock, Phone, Lock, Mail, Bell, User, FileText, Database, Share2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TreeNode {
  id: string
  label: string
  icon?: keyof typeof icons
  description: string
  x?: number
  y?: number
  children?: TreeNode[]
}

const icons = {
  Settings,
  CreditCard,
  Users,
  Activity,
  Clock,
  Phone,
  Lock,
  Mail,
  Bell,
  User,
  FileText,
  Database,
  Share2,
  MessageSquare,
  Calendar
}

export function ProjectTree() {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const treeData: TreeNode = {
    id: "root",
    label: "POLKADOT CLOUD",
    description: "Project overview and feature roadmap",
    children: [
      {
        id: "profile",
        label: "IDENTITY",
        icon: "User",
        description: "User profile management and settings",
        x: -400,
        y: 100,
        children: [
          { 
            id: "edit-profile", 
            label: "Edit Profile", 
            icon: "Settings",
            description: "Modify user profile information",
            x: -400,
            y: 200
          },
          { 
            id: "notifications", 
            label: "Notifications", 
            icon: "Bell",
            description: "Manage notification preferences",
            x: -300,
            y: 200
          }
        ]
      },
      {
        id: "cards",
        label: "PAYMENTS",
        icon: "CreditCard",
        description: "Card management and settings",
        x: -200,
        y: 100,
        children: [
          { 
            id: "physical-cards", 
            label: "Polkadot Pay", 
            icon: "CreditCard",
            description: "Manage physical card requests and settings",
            x: -200,
            y: 200
          }
        ]
      },
      {
        id: "accounts",
        label: "ADDRESSES",
        icon: "Users",
        description: "Account management and settings",
        x: 0,
        y: 100,
        children: [
          { 
            id: "account-settings", 
            label: "Address Formats", 
            icon: "Settings",
            description: "Configure account preferences and security",
            x: 0,
            y: 200
          }
        ]
      },
      {
        id: "payments",
        label: "TRANSACTIONS",
        icon: "Activity",
        description: "Payment processing and history",
        x: 200,
        y: 100,
        children: [
          { 
            id: "send-money", 
            label: "Send Stablecoins", 
            icon: "Share2",
            description: "Transfer funds to other accounts",
            x: 200,
            y: 200
          }
        ]
      }
    ]
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsDragging(true)
    const startX = e.clientX - position.x
    const startY = e.clientY - position.y
    
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - startX,
        y: e.clientY - startY
      })
    }
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      setIsDragging(false)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY * -0.001
    setScale(prevScale => {
      const newScale = Math.min(Math.max(0.5, prevScale + delta), 2)
      const mouseX = e.clientX - position.x
      const mouseY = e.clientY - position.y
      const newX = e.clientX - mouseX * newScale / prevScale
      const newY = e.clientY - mouseY * newScale / prevScale
      setPosition({ x: newX, y: newY })
      return newScale
    })
  }

  const renderConnections = (node: TreeNode) => {
    return (
      <>
        {node.children?.map(child => (
          <g key={`connection-${node.id}-${child.id}`}>
            <line
              x1={node.x || 0}
              y1={node.y || 0}
              x2={child.x || 0}
              y2={child.y || 0}
              stroke="#e6007a"
              strokeWidth="2"
              opacity="0.5"
            />
            {renderConnections(child)}
          </g>
        ))}
      </>
    )
  }

  const renderNodes = (node: TreeNode) => {
    const Icon = node.icon ? icons[node.icon] : undefined

    return (
      <>
        <g key={node.id} transform={`translate(${node.x || 0},${node.y || 0})`}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <g className="cursor-pointer transform transition-transform hover:scale-110">
                  <circle
                    r={20}
                    fill="#2a2a2a"
                    stroke="#e6007a"
                    strokeWidth="2"
                    className="transition-colors hover:fill-[#3a3a3a]"
                  />
                  <circle
                    r={22}
                    fill="none"
                    stroke="#e6007a"
                    strokeWidth="1"
                    opacity="0.5"
                    className="animate-pulse"
                  />
                  {Icon && (
                    <foreignObject x="-12" y="-12" width="24" height="24">
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon className="w-4 h-4 text-[#e6007a]" />
                      </div>
                    </foreignObject>
                  )}
                </g>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm font-medium">{node.label}</p>
                <p className="text-xs text-gray-400">{node.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <text
            y={35}
            textAnchor="middle"
            className="text-white text-xs font-medium fill-current"
          >
            {node.label}
          </text>
        </g>
        {node.children?.map(child => renderNodes(child))}
      </>
    )
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] overflow-hidden relative">
      {/* Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Clouds */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: `${Math.random() * 30}%`,
              left: `${Math.random() * 100}%`,
              transform: `scale(${0.5 + Math.random() * 0.5})`
            }}
          >
            <Cloud className="text-[#4a6d8c] w-16 h-16 opacity-30" />
          </div>
        ))}
        
        {/* Polka Dots */}
        <div className="absolute bottom-0 w-full h-32 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-[#e6007a]"
              style={{
                width: `${Math.random() * 15 + 5}px`,
                height: `${Math.random() * 15 + 5}px`,
                bottom: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: 0.1 + Math.random() * 0.2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="fixed top-4 right-4 flex gap-2 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setScale(s => Math.min(s + 0.1, 2))}
          className="bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#3a3a3a]"
        >
          <Plus className="h-4 w-4 text-[#e6007a]" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setScale(s => Math.max(s - 0.1, 0.5))}
          className="bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#3a3a3a]"
        >
          <Minus className="h-4 w-4 text-[#e6007a]" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setScale(1)
            setPosition({ x: 0, y: 0 })
          }}
          className="bg-[#2a2a2a] border-[#3a3a3a] hover:bg-[#3a3a3a]"
        >
          <Home className="h-4 w-4 text-[#e6007a]" />
        </Button>
      </div>

      {/* Tree Key */}
      <Card className="fixed bottom-4 right-4 bg-[#2a2a2a] border-[#3a3a3a] p-4">
        <div className="text-sm text-[#e6007a] font-medium mb-2">TREE KEY</div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#e6007a]" />
            <span className="text-xs text-gray-400">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#3a3a3a]" />
            <span className="text-xs text-gray-400">Inactive</span>
          </div>
        </div>
      </Card>

      {/* Main Tree Visualization */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      >
        <svg
          width="100%"
          height="100%"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          <g transform={`translate(${window.innerWidth / 2},${window.innerHeight / 4})`}>
            {renderConnections(treeData)}
            {renderNodes(treeData)}
          </g>
        </svg>
      </div>
    </div>
  )
}

export default ProjectTree
