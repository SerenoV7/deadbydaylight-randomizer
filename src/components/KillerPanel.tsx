import { useState, useEffect } from 'react'
import type { Killer, KillerResult } from '../assets/data'
import PerkIcon from './PerkIcon'
import CharacterPortrait from './CharacterPortrait'
import AddonIcon from './AddonIcon'

interface KillerPanelProps {
    onBack: () => void
}

export default function KillerPanel({ onBack }: KillerPanelProps) {

    const [checkedItems, setCheckedItems] = useState({
        killer: false,
        addons: false,
        perks: false,
    })

    const [killers, setKillers] = useState<{ [key: string]: Killer }>({})
    const [selectedKiller, setSelectedKiller] = useState<string>('')
    const [killerResult, setKillerResult] = useState<KillerResult | null>(null)

    useEffect(() => {
        fetch('/data/characters.json')
            .then((response) => response.json())
            .then((data) => setKillers(data))
            .catch((error) => console.error('Error fetching killers:', error))
    }, [])

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCheckedItems({
            ...checkedItems,
            [event.target.name]: event.target.checked,
        })
    }

    const handleKillerSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedKiller(event.target.value)
    }

    const handleRandomizeClick = async () => {
        const isAnyChecked = Object.values(checkedItems).some((isChecked) => isChecked)
        if (!isAnyChecked) {
            alert('Please select at least one option to randomize.')
            return
        }

        try {

            const handleKillerRandomize = async () => {
                try {
                    const [addonsData, perksData] = await Promise.all([
                        fetch('/data/addons.json').then((res) => res.json()),
                        fetch('/data/perks.json').then((res) => res.json()),
                    ])

                    let selectedKillerName = selectedKiller

                    if (checkedItems.killer && !selectedKiller) {
                        const killerNames = Object.keys(killers)
                        selectedKillerName = killerNames[Math.floor(Math.random() * killerNames.length)]
                    }

                    let randomizedAddons: string[] = []
                    if (checkedItems.addons && selectedKillerName) {
                        const killerItem = killers[selectedKillerName]?.item
                        if (killerItem) {
                            const killerAddons = Object.entries(addonsData)
                                .filter(([, addon]: [string, any]) => addon.parents?.includes(killerItem))
                                .map(([name]) => name)

                            if (killerAddons.length >= 2) {
                                const addon1 = killerAddons[Math.floor(Math.random() * killerAddons.length)]
                                let addon2 = killerAddons[Math.floor(Math.random() * killerAddons.length)]
                                while (addon2 === addon1 && killerAddons.length > 1) {
                                    addon2 = killerAddons[Math.floor(Math.random() * killerAddons.length)]
                                }
                                randomizedAddons = [addon1, addon2]
                            }
                        }
                    }

                    const randomizedPerks: string[] = []
                    if (checkedItems.perks) {
                        const killerPerks = Object.entries(perksData)
                            .filter(([, perk]: [string, any]) => perk.role === 'killer')
                            .map(([name]) => name)

                        for (let i = 0; i < 4 && killerPerks.length > 0; i++) {
                            let randomPerk = killerPerks[Math.floor(Math.random() * killerPerks.length)]
                            while (randomizedPerks.includes(randomPerk) && killerPerks.length > randomizedPerks.length) {
                                randomPerk = killerPerks[Math.floor(Math.random() * killerPerks.length)]
                            }
                            randomizedPerks.push(randomPerk)
                        }
                    }

                    setKillerResult({
                        name: selectedKillerName,
                        addons: randomizedAddons,
                        perks: randomizedPerks,
                    })
                } catch (error) {
                    console.error('Error during killer randomization:', error)
                    alert('An error occurred during killer randomization.')
                }
            }

            if (checkedItems.killer || checkedItems.addons || checkedItems.perks) {
                await handleKillerRandomize()
            }

        } catch (error) {
            console.error('Error fetching data for randomization:', error)
            alert('An error occurred while fetching data for randomization.')
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center w-full bg-gray-950">

            {killerResult ? (
                /* Result screen */
                <div className="relative flex flex-col items-center">
                    <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
                        <div className="grayscale">
                            <CharacterPortrait name={killerResult.name} className="w-300 h-300" />
                        </div>
                    </div>

                    <h2 className="roboto-condensed-bold text-5xl tracking-widest uppercase text-red-500 mb-1 z-10 text-center">
                        {killerResult.name}
                    </h2>
                    <p className="roboto text-gray-600 text-xs tracking-widest uppercase mb-10 z-10">Your loadout</p>

                    {killerResult.addons.length > 0 && (
                        <div className="mb-8 z-10 flex flex-col items-center">
                            <p className="roboto text-gray-500 text-xs tracking-widest uppercase mb-4">Addons</p>
                            <div className="flex gap-4">
                                {killerResult.addons.map((addon, idx) => (
                                    <AddonIcon key={idx} name={addon} className="w-24 h-24" />
                                ))}
                            </div>
                        </div>
                    )}

                    {killerResult.perks.length > 0 && (
                        <div className="mb-10 z-9 flex flex-col items-center">
                            <p className="roboto text-gray-500 text-xs tracking-widest uppercase mb-4">Perks</p>
                            <div className="grid grid-cols-4 gap-6">
                                {killerResult.perks.map((perk, idx) => (
                                    <PerkIcon key={idx} name={perk} className="w-28 h-28" />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col items-center gap-2 z-8">
                        <button
                            onClick={() => setKillerResult(null)}
                            className="px-6 py-2 border border-red-900 hover:border-red-500 bg-gray-900 hover:bg-gray-800 text-red-500 hover:text-red-400 roboto-condensed-bold tracking-widest uppercase text-sm transition-all duration-300 cursor-pointer"
                        >
                            Randomize Again
                        </button>
                        <button
                            onClick={onBack}
                            className="roboto text-xs text-gray-600 hover:text-gray-400 tracking-widest uppercase transition-colors duration-200 cursor-pointer mt-1"
                        >
                            ← Back to Home
                        </button>
                    </div>
                </div>
            ) : (
                /* Setup screen */
                <>
                    <p className="roboto text-gray-500 text-xs tracking-widest uppercase mb-8">Killer Loadout</p>

                    <div className="relative border border-red-900 bg-gray-900 p-10 flex flex-col items-center w-72 overflow-hidden">
                        <div className="absolute inset-0 opacity-5 bg-red-600 blur-2xl pointer-events-none" />

                        <img src="/icons/killer.png" alt="Killer Icon" className="w-16 h-16 object-contain opacity-80 mb-6" />

                        <h1 className="roboto-condensed-bold text-2xl tracking-widest uppercase text-white mb-6 text-center">
                            What to randomize?
                        </h1>

                        <div className="w-full flex flex-col gap-3 z-10">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="killer"
                                    checked={checkedItems.killer}
                                    onChange={handleCheckboxChange}
                                    className="w-4 h-4 accent-red-500 cursor-pointer"
                                />
                                <span className="roboto text-sm tracking-widest uppercase text-gray-400 group-hover:text-white transition-colors duration-200">
                                    Killer
                                </span>
                            </label>

                            {!checkedItems.killer && (
                                <select
                                    value={selectedKiller}
                                    onChange={handleKillerSelect}
                                    className="w-full px-3 py-2 border border-gray-800 bg-gray-950 text-gray-400 roboto text-sm focus:outline-none focus:border-red-900 transition-colors duration-200"
                                >
                                    <option value="" disabled>Select a Killer</option>
                                    {Object.keys(killers).map((killerName) => (
                                        <option key={killerName} value={killerName}>{killerName}</option>
                                    ))}
                                </select>
                            )}

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="addons"
                                    checked={checkedItems.addons}
                                    onChange={handleCheckboxChange}
                                    className="w-4 h-4 accent-red-500 cursor-pointer"
                                />
                                <span className="roboto text-sm tracking-widest uppercase text-gray-400 group-hover:text-white transition-colors duration-200">
                                    Addons
                                </span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="perks"
                                    checked={checkedItems.perks}
                                    onChange={handleCheckboxChange}
                                    className="w-4 h-4 accent-red-500 cursor-pointer"
                                />
                                <span className="roboto text-sm tracking-widest uppercase text-gray-400 group-hover:text-white transition-colors duration-200">
                                    Perks
                                </span>
                            </label>
                        </div>

                        <div className="w-full h-px bg-gray-800 my-6 z-10" />

                        <div className="flex flex-col items-center gap-2 w-full z-10">
                            <button
                                onClick={handleRandomizeClick}
                                className="w-full px-6 py-2 border border-red-900 hover:border-red-500 bg-gray-950 hover:bg-gray-800 text-red-500 hover:text-red-400 roboto-condensed-bold tracking-widest uppercase text-sm transition-all duration-300 cursor-pointer"
                            >
                                Randomize
                            </button>
                            <button
                                onClick={onBack}
                                className="roboto text-xs text-gray-600 hover:text-gray-400 tracking-widest uppercase transition-colors duration-200 cursor-pointer mt-1"
                            >
                                ← Back to Home
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}