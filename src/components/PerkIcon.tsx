import React, { useState, useEffect } from 'react'

interface PerkIconProps {
  name: string
  className?: string
}

interface PerkData {
  [key: string]: {
    name: string
    description: string
    role: string
    image: string
  }
}

interface TooltipProps {
  name: string
  description: string
  isVisible: boolean
}

const PerkIcon: React.FC<PerkIconProps> = ({ name, className }) => {
  const [imagePath, setImagePath] = useState<string>('')
  const [perkName, setPerkName] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [showTooltip, setShowTooltip] = useState<boolean>(false)
  const [tooltipPosition, setTooltipPosition] = useState<{x: number, y: number}>({x: 0, y: 0})

  useEffect(() => {
    fetch('/data/perks.json')
      .then((response) => response.json())
      .then((data: PerkData) => {
        const perkKey = Object.keys(data).find((key) => key === name)
        if (perkKey && data[perkKey].image) {
          setImagePath(`${data[perkKey].image}`)
          setPerkName(data[perkKey].name)
          setDescription(data[perkKey].description)
        } else {
          setImagePath(`/icons/Perks/${name.replace(/\s+/g, '')}.png`)
          setPerkName(name)
        }
      })
      .catch((error) => {
        console.error('Error fetching perk data:', error)
        setImagePath(`/icons/Perks/${name.replace(/\s+/g, '')}.png`)
        setPerkName(name)
      })
  }, [name])

  if (!imagePath) {
    return <div className={`perk-icon ${className || ''}`}>Loading...</div>
  }

  const Tooltip: React.FC<TooltipProps & { position: {x: number, y: number} }> = ({ name, description, isVisible, position }) => {
    if (!isVisible) return null

    return (
      <div className="fixed z-50 p-4 bg-gray-800 text-white text-base rounded shadow-lg text-left" style={{ 
        left: `${position.x + 15}px`,
        top: `${position.y + 15}px`,
        width: '380px',
        maxWidth: '380px'
      }}>
        <style>
          {`
            .green { color: #4CAF50; }
            .blue { color: #2196F3; }
            .purple { color: #9C27B0; }
            .red { color: #F44336; }
            .yellow { color: #FFEB3B; }
            .orange { color: #FF9800; }
          `}
        </style>
        <div className="font-bold mb-2">{name}</div>
        <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: description }}></div>
      </div>
    )
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPosition({x: e.clientX, y: e.clientY})
  }

  return (
    <div className={`perk-icon ${className || ''} relative`} onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)} onMouseMove={handleMouseMove}>
      <Tooltip name={perkName} description={description} isVisible={showTooltip} position={tooltipPosition} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-11/16 h-11/16 border-2 border-pink-600 transform rotate-45"></div>
      </div>
      <div className="relative z-10">
        <img src={imagePath} alt={`${name} Perk`} className="w-full h-full object-contain" />
      </div>
    </div>
  )
}

export default PerkIcon
