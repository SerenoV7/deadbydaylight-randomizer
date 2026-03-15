import { createRoot } from 'react-dom/client'
import './index.css'
import { useState } from 'react'
import HomeScreen from './components/HomeScreen'
import KillerPanel from './components/KillerPanel'
import SurvivorPanel from './components/SurvivorPanel'

type View = 'home' | 'killer' | 'survivor'

export default function App() {
    const [view, setView] = useState<View>('home')
 
    return (
        <>
            {view === 'home' && (
                <HomeScreen onSelect={(role) => setView(role)} />
            )}
            {view === 'killer' && (
                <KillerPanel onBack={() => setView('home')} />
            )}
            {view === 'survivor' && (
                <SurvivorPanel onBack={() => setView('home')} />
            )}
        </>
    )
}

createRoot(document.getElementById('root')!).render(
  <App />
)