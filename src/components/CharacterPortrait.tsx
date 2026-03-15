import React, { useState, useEffect } from 'react'

interface CharacterPortraitProps {
  name: string
  className?: string
}

interface CharacterData {
  [key: string]: {
    image: string
    item: string
  }
}

const CharacterPortrait: React.FC<CharacterPortraitProps> = ({ name, className }) => {
  const [imagePath, setImagePath] = useState<string>('')

  useEffect(() => {
    fetch('/data/characters.json')
      .then((response) => response.json())
      .then((data: CharacterData) => {
        const characterKey = Object.keys(data).find((key) => key === name)
        if (characterKey && data[characterKey].image) {
          setImagePath(`${data[characterKey].image}`)
        } else {
          setImagePath(`/icons/CharPortraits/${name.replace(/\s+/g, '')}_Portrait.png`)
        }
      })
      .catch((error) => {
        console.error('Error fetching character data:', error)
        setImagePath(`/icons/CharPortraits/${name.replace(/\s+/g, '')}_Portrait.png`)
      })
  }, [name])

  if (!imagePath) {
    return <div className={`character-portrait ${className || ''}`}>Loading...</div>
  }

  return (
    <div className={`character-portrait ${className || ''}`}>
      <img src={imagePath} alt={`${name} Portrait`} className="w-full h-full object-contain" />
    </div>
  )
}

export default CharacterPortrait
