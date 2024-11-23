"use client"

import * as React from "react"
import { Check, ChevronDown } from 'lucide-react'
import { kusamaChainsConfig, ChainConfig } from './chains'

interface DropdownProps {
  selectedChain: string | null;
  setSelectedChain: (rpcUrl: string) => void;
}

export function Dropdown({ selectedChain, setSelectedChain }: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const handleSelect = (chain: ChainConfig) => {
    if (chain.rpcUrl) {
      setSelectedChain(chain.rpcUrl);
      setIsOpen(false);
    }
  };

  const selectedChainConfig = React.useMemo(() => {
    return Object.values(kusamaChainsConfig).find(chain => chain.rpcUrl === selectedChain)
  }, [selectedChain])

  const filteredChains = React.useMemo(() => {
    return Object.values(kusamaChainsConfig).filter((chain) => 
      chain && chain.displayName && chain.rpcUrl
    );
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  if (!filteredChains.length) {
    console.error("No chains available")
    return null
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="h-[38px] bg-black text-white border-2 border-black px-4 py-2 text-sm font-bold transition-colors active:shadow-none relative overflow-hidden w-[200px] flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate flex items-center">
          {selectedChainConfig ? (
            <>
              <span 
                className="w-4 h-4 rounded-full mr-2 flex items-center justify-center" 
                style={{ backgroundColor: selectedChainConfig.color }}
              >
                {selectedChainConfig.icon && <selectedChainConfig.icon className="w-3 h-3 text-white" />}
              </span>
              {selectedChainConfig.displayName}
            </>
          ) : (
            "Select chain..."
          )}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 ml-2" />
      </button>
      {isOpen && (
        <div className="absolute z-20 w-[200px] top-[38px] bg-black border-2 border-t-0 border-black">
          <div className="py-1">
            {filteredChains.map((chain) => (
              <button
                key={chain.paraId}
                className="flex items-center w-full px-4 py-2 text-sm text-left text-white hover:bg-gray-800"
                onClick={() => handleSelect(chain)}
              >
                <span 
                  className="w-4 h-4 rounded-full mr-2 flex items-center justify-center" 
                  style={{ backgroundColor: chain.color }}
                >
                  {chain.icon && <chain.icon className="w-3 h-3 text-white" />}
                </span>
                <span className="truncate">{chain.displayName}</span>
                {selectedChain === chain.rpcUrl && (
                  <Check className="ml-auto h-4 w-4 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}