import { createRoot } from 'react-dom/client'
import './index.css'
import { useState, useEffect } from 'react'
import HomeScreen from './components/HomeScreen'
import KillerPanel from './components/KillerPanel'
import SurvivorPanel from './components/SurvivorPanel'

type View = 'home' | 'killer' | 'survivor'

interface VersionData {
    version: string
}

const VERSION_CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes
const CURRENT_VERSION_KEY = 'app_version'

export default function App() {
    const [view, setView] = useState<View>('home')
    const [randomizerVersion, setRandomizerVersion] = useState<string>('Loading...')
    const [showUpdatePopup, setShowUpdatePopup] = useState<boolean>(false)
    const [newVersion, setNewVersion] = useState<string>('')

    const clearStorageAndReload = () => {
        localStorage.clear()
        sessionStorage.clear()
        window.location.reload()
    }

    const fetchAndCheckVersion = async () => {
        try {
            const response = await fetch('/data/version.json')
            const data: VersionData = await response.json()
            return data.version
        } catch (error) {
            console.error('Error fetching version:', error)
            return null
        }
    }

    useEffect(() => {
        // Initial version fetch and storage
        const initializeVersion = async () => {
            const version = await fetchAndCheckVersion()
            if (version) {
                setRandomizerVersion(version)
                localStorage.setItem(CURRENT_VERSION_KEY, version)
            } else {
                setRandomizerVersion('Unknown')
            }
        }

        initializeVersion()

        // Set up interval to check for version updates
        const versionCheckInterval = setInterval(async () => {
            const latestVersion = await fetchAndCheckVersion()
            const storedVersion = localStorage.getItem(CURRENT_VERSION_KEY)

            if (latestVersion && storedVersion && latestVersion !== storedVersion) {
                setNewVersion(latestVersion)
                setShowUpdatePopup(true)
            }
        }, VERSION_CHECK_INTERVAL)

        return () => clearInterval(versionCheckInterval)
    }, [])

    return (
        <>
            {/* Update Popup */}
            {showUpdatePopup && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-gray-900 border-2 border-yellow-600 p-8 rounded-lg text-center max-w-md">
                        <h2 className="roboto-condensed-bold text-2xl text-yellow-500 mb-4 uppercase tracking-widest">
                            New Version Available
                        </h2>
                        <p className="roboto text-gray-300 mb-2">
                            A new version of the Randomizer is available.
                        </p>
                        <p className="roboto text-gray-400 text-sm mb-6">
                            Current: <span className="text-yellow-500">{randomizerVersion}</span> → New: <span className="text-yellow-500">{newVersion}</span>
                        </p>
                        <button
                            onClick={clearStorageAndReload}
                            className="roboto-condensed-bold px-8 py-3 bg-yellow-600 hover:bg-yellow-500 text-black uppercase tracking-widest transition-colors duration-200"
                        >
                            Update Now
                        </button>
                    </div>
                </div>
            )}

            {view === 'home' && (
                <HomeScreen onSelect={(role) => setView(role)} randomizerVersion={randomizerVersion} />
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