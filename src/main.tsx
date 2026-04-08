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
    //const [gameVersion, setGameVersion] = useState<string>('Loading...')
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

    // const fetchGameVersion = async () => {
    //     try {
    //         const response = await fetch('https://dbd.tricky.lol/api/patchnotes')
    //         const data = await response.json()
    //         // Get the last id from the response
    //         if (Array.isArray(data) && data.length > 0) {
    //             const lastPatchNote = data[data.length - 1]
    //             return lastPatchNote.id
    //         }
    //         return 'Unknown'
    //     } catch (error) {
    //         console.error('Error fetching game version:', error)
    //         return 'Unknown'
    //     }
    // }

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

            //const gdbVersion = await fetchGameVersion()
            //setGameVersion(gdbVersion)
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
                <div className="fixed top-4 right-4 z-50">
                    <div className="bg-gray-800 border-2 border-gray-600 p-6 rounded-lg text-center max-w-sm shadow-lg">
                        <h2 className="roboto-condensed-bold text-xl text-gray-300 mb-3 uppercase tracking-widest">
                            New Version Available
                        </h2>
                        <p className="roboto text-gray-400 mb-2 text-sm">
                            A new version of the Randomizer is available.
                        </p>
                        <p className="roboto text-gray-500 text-xs mb-4">
                            Current: <span className="text-gray-300">{randomizerVersion}</span> → New: <span className="text-gray-300">{newVersion}</span>
                        </p>
                        <button
                            onClick={clearStorageAndReload}
                            className="roboto-condensed-bold px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 uppercase tracking-widest transition-colors duration-200 text-sm"
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