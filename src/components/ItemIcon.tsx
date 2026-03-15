import React, { useState, useEffect } from 'react'

interface ItemIconProps {
  name: string
  className?: string
}

interface ItemData {
  [key: string]: {
    name: string
    description: string
    rarity: string
    image: string
  }
}

interface TooltipProps {
  name: string
  description: string
  isVisible: boolean
  position: {x: number, y: number}
}

const ItemIcon: React.FC<ItemIconProps> = ({ name, className }) => {
  const [imagePath, setImagePath] = useState<string>('')
  const [rarity, setRarity] = useState<string>('common')
  const [itemName, setItemName] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [showTooltip, setShowTooltip] = useState<boolean>(false)
  const [tooltipPosition, setTooltipPosition] = useState<{x: number, y: number}>({x: 0, y: 0})

  useEffect(() => {
    fetch('/data/items.json')
      .then((response) => response.json())
      .then((data: ItemData) => {
        const itemKey = Object.keys(data).find((key) => key === name)
        if (itemKey && data[itemKey].image) {
          setImagePath(`${data[itemKey].image}`)
          setRarity(data[itemKey].rarity)
          setItemName(data[itemKey].name)
          setDescription(data[itemKey].description)
        } else {
          setImagePath(`/icons/Items/${name.replace(/\s+/g, '')}.png`)
          setItemName(name)
        }
      })
      .catch((error) => {
        console.error('Error fetching item data:', error)
        setImagePath(`/icons/Items/${name.replace(/\s+/g, '')}.png`)
        setItemName(name)
      })
  }, [name])

  const getBorderColor = () => {
    switch (rarity.toLowerCase()) {
      case 'common':
        return 'border-brown-500'
      case 'uncommon':
        return 'border-green-500'
      case 'rare':
        return 'border-blue-500'
      case 'veryrare':
        return 'border-purple-500'
      case 'visceral':
        return 'border-red-500'
      default:
        return 'border-gray-500'
    }
  }

  const Tooltip: React.FC<TooltipProps> = ({ name, description, isVisible, position }) => {
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

  if (!imagePath) {
    return <div className={`item-icon ${className || ''}`}>Loading...</div>
  }

  return (
    <div className={`item-icon ${className || ''} relative`} onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)} onMouseMove={handleMouseMove}>
      <Tooltip name={itemName} description={description} isVisible={showTooltip} position={tooltipPosition} />
      <div className={`border-2 ${getBorderColor()} p-1`}>
        <img src={imagePath} alt={`${name} Item`} className="w-full h-full object-contain" />
      </div>
    </div>
  )
}

export default ItemIcon
