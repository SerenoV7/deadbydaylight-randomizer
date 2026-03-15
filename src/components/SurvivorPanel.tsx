import { useState } from 'react'
import PerkIcon from './PerkIcon'
import AddonIcon from './AddonIcon'
import ItemIcon from './ItemIcon'

const ITEM_TYPES = ['toolbox', 'map', 'key', 'flashlight', 'medkit', 'fogvial'] as const
type ItemType = (typeof ITEM_TYPES)[number]

interface SurvivorResult {
    item: string | null
    itemType: ItemType | null
    addons: string[]
    perks: string[]
}

interface SurvivorPanelProps {
    onBack: () => void
}

export default function SurvivorPanel({ onBack }: SurvivorPanelProps) {

    const [checkedItems, setCheckedItems] = useState({
        item: false,
        addons: false,
        perks: false,
    })

    const [survivorResult, setSurvivorResult] = useState<SurvivorResult | null>(null)

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target
        setCheckedItems({
            ...checkedItems,
            [name]: checked,
            ...(name === 'item' && !checked ? { addons: false } : {}),
        })
    }

    const handleRandomizeClick = async () => {
        const isAnyChecked = Object.values(checkedItems).some((isChecked) => isChecked)
        if (!isAnyChecked) {
            alert('Please select at least one option to randomize.')
            return
        }

        try {
            const [itemsData, addonsData, perksData] = await Promise.all([
                fetch('/data/items.json').then((res) => res.json()),
                fetch('/data/addons.json').then((res) => res.json()),
                fetch('/data/perks.json').then((res) => res.json()),
            ])

            let selectedItem: string | null = null
            let selectedItemType: ItemType | null = null

            if (checkedItems.item) {
                const randomType = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)]
                selectedItemType = randomType

                const itemsOfType = Object.entries(itemsData)
                    .filter(([, item]: [string, any]) =>
                        item.item_type === randomType && item.rarity !== 'none'
                    )
                    .map(([name]) => name)

                if (itemsOfType.length > 0) {
                    selectedItem = itemsOfType[Math.floor(Math.random() * itemsOfType.length)]
                }
            }

            const randomizedAddons: string[] = []
            if (checkedItems.addons && selectedItemType) {
                const typeAddons = Object.entries(addonsData)
                    .filter(([, addon]: [string, any]) => addon.item_type === selectedItemType)
                    .map(([name]) => name)

                if (typeAddons.length >= 2) {
                    const addon1 = typeAddons[Math.floor(Math.random() * typeAddons.length)]
                    let addon2 = typeAddons[Math.floor(Math.random() * typeAddons.length)]
                    while (addon2 === addon1 && typeAddons.length > 1) {
                        addon2 = typeAddons[Math.floor(Math.random() * typeAddons.length)]
                    }
                    randomizedAddons.push(addon1, addon2)
                }
            }

            const randomizedPerks: string[] = []
            if (checkedItems.perks) {
                const survivorPerks = Object.entries(perksData)
                    .filter(([, perk]: [string, any]) => perk.role === 'survivor')
                    .map(([name]) => name)

                for (let i = 0; i < 4 && survivorPerks.length > 0; i++) {
                    let randomPerk = survivorPerks[Math.floor(Math.random() * survivorPerks.length)]
                    while (randomizedPerks.includes(randomPerk) && survivorPerks.length > randomizedPerks.length) {
                        randomPerk = survivorPerks[Math.floor(Math.random() * survivorPerks.length)]
                    }
                    randomizedPerks.push(randomPerk)
                }
            }

            setSurvivorResult({
                item: selectedItem,
                itemType: selectedItemType,
                addons: randomizedAddons,
                perks: randomizedPerks,
            })
        } catch (error) {
            console.error('Error during survivor randomization:', error)
            alert('An error occurred during survivor randomization.')
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center w-full bg-gray-950">

            {survivorResult ? (
                /* Result screen */
                <div className="flex flex-col items-center">
                    <h2 className="roboto-condensed-bold text-5xl tracking-widest uppercase text-blue-500 mb-1 text-center">
                        {survivorResult.itemType
                            ? survivorResult.itemType.charAt(0).toUpperCase() + survivorResult.itemType.slice(1)
                            : 'Your Loadout'}
                    </h2>
                    <p className="roboto text-gray-600 text-xs tracking-widest uppercase mb-10">Your loadout</p>

                    {(survivorResult.item || survivorResult.addons.length > 0) && (
                        <div className="mb-8 flex flex-col items-center">
                            <p className="roboto text-gray-500 text-xs tracking-widest uppercase mb-4">
                                {survivorResult.item && survivorResult.addons.length > 0
                                    ? 'Item & Addons'
                                    : survivorResult.item ? 'Item' : 'Addons'}
                            </p>
                            <div className="flex items-center gap-4">
                                {survivorResult.item && (
                                    <ItemIcon name={survivorResult.item} className="w-24 h-24" />
                                )}
                                {survivorResult.item && survivorResult.addons.length > 0 && (
                                    <div className="w-px h-16 bg-gray-700" />
                                )}
                                {survivorResult.addons.map((addon, idx) => (
                                    <AddonIcon key={idx} name={addon} className="w-24 h-24" />
                                ))}
                            </div>
                        </div>
                    )}

                    {survivorResult.perks.length > 0 && (
                        <div className="mb-10 flex flex-col items-center">
                            <p className="roboto text-gray-500 text-xs tracking-widest uppercase mb-4">Perks</p>
                            <div className="grid grid-cols-4 gap-6">
                                {survivorResult.perks.map((perk, idx) => (
                                    <PerkIcon key={idx} name={perk} className="w-28 h-28" />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col items-center gap-2">
                        <button
                            onClick={() => setSurvivorResult(null)}
                            className="px-6 py-2 border border-blue-900 hover:border-blue-500 bg-gray-900 hover:bg-gray-800 text-blue-500 hover:text-blue-400 roboto-condensed-bold tracking-widest uppercase text-sm transition-all duration-300 cursor-pointer"
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
                    <p className="roboto text-gray-500 text-xs tracking-widest uppercase mb-8">Survivor Loadout</p>

                    <div className="relative border border-blue-900 bg-gray-900 p-10 flex flex-col items-center w-72 overflow-hidden">
                        <div className="absolute inset-0 opacity-5 bg-blue-600 blur-2xl pointer-events-none" />

                        <img src="/icons/survivor.png" alt="Survivor Icon" className="w-16 h-16 object-contain opacity-80 mb-6" />

                        <h1 className="roboto-condensed-bold text-2xl tracking-widest uppercase text-white mb-6 text-center">
                            What to randomize?
                        </h1>

                        <div className="w-full flex flex-col gap-3 z-10">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="item"
                                    checked={checkedItems.item}
                                    onChange={handleCheckboxChange}
                                    className="w-4 h-4 accent-blue-500 cursor-pointer"
                                />
                                <span className="roboto text-sm tracking-widest uppercase text-gray-400 group-hover:text-white transition-colors duration-200">
                                    Item
                                </span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="addons"
                                    checked={checkedItems.addons}
                                    onChange={handleCheckboxChange}
                                    disabled={!checkedItems.item}
                                    className="w-4 h-4 accent-blue-500 cursor-pointer disabled:opacity-40"
                                />
                                <span className={`roboto text-sm tracking-widest uppercase transition-colors duration-200 ${!checkedItems.item ? 'text-gray-700' : 'text-gray-400 group-hover:text-white'}`}>
                                    Addons
                                </span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="perks"
                                    checked={checkedItems.perks}
                                    onChange={handleCheckboxChange}
                                    className="w-4 h-4 accent-blue-500 cursor-pointer"
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
                                className="w-full px-6 py-2 border border-blue-900 hover:border-blue-500 bg-gray-950 hover:bg-gray-800 text-blue-500 hover:text-blue-400 roboto-condensed-bold tracking-widest uppercase text-sm transition-all duration-300 cursor-pointer"
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