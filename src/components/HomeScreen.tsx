type Role = 'killer' | 'survivor'

interface HomeScreenProps {
    onSelect: (role: Role) => void
}

export default function HomeScreen({ onSelect }: HomeScreenProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center w-full bg-gray-950">
            <h1 className="roboto-condensed-bold text-4xl tracking-widest uppercase text-white mb-2">
                Dead by Daylight
            </h1>
            <p className="roboto text-gray-500 text-sm tracking-widest uppercase mb-16">
                Loadout Randomizer
            </p>
            <p className="roboto text-gray-500 text-sm tracking-widest uppercase mb-16">
                Game Version: 9.5.0
            </p>

            <div className="flex gap-6">
                {/* Killer card */}
                <button
                    onClick={() => onSelect('killer')}
                    className="group relative w-56 h-72 flex flex-col items-center justify-end pb-8 overflow-hidden border border-red-900 hover:border-red-500 transition-all duration-300 cursor-pointer bg-gray-900 hover:bg-gray-800"
                >
                    {/* Glow effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-red-600 blur-xl pointer-events-none" />

                    {/* Icon */}
                    <img
                        src="/icons/killer.png"
                        alt="Killer"
                        className="absolute top-8 w-24 h-24 object-contain opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
                    />

                    {/* Label */}
                    <span className="roboto-condensed-bold text-2xl tracking-widest uppercase text-red-500 group-hover:text-red-400 transition-colors duration-200 z-10">
                        Killer
                    </span>
                    <span className="roboto text-xs text-gray-600 group-hover:text-gray-400 tracking-wider uppercase mt-1 z-10 transition-colors duration-200">
                        Randomize loadout
                    </span>
                </button>

                {/* Divider */}
                <div className="flex flex-col items-center justify-center gap-2 select-none">
                    <div className="w-px h-24 bg-gradient-to-b from-transparent via-gray-700 to-transparent" />
                    <span className="roboto text-gray-600 text-xs uppercase tracking-widest">vs</span>
                    <div className="w-px h-24 bg-gradient-to-b from-transparent via-gray-700 to-transparent" />
                </div>

                {/* Survivor card */}
                <button
                    onClick={() => onSelect('survivor')}
                    className="group relative w-56 h-72 flex flex-col items-center justify-end pb-8 overflow-hidden border border-blue-900 hover:border-blue-500 transition-all duration-300 cursor-pointer bg-gray-900 hover:bg-gray-800"
                >
                    {/* Glow effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-blue-600 blur-xl pointer-events-none" />

                    {/* Icon */}
                    <img
                        src="/icons/survivor.png"
                        alt="Survivor"
                        className="absolute top-8 w-24 h-24 object-contain opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
                    />

                    {/* Label */}
                    <span className="roboto-condensed-bold text-2xl tracking-widest uppercase text-blue-500 group-hover:text-blue-400 transition-colors duration-200 z-10">
                        Survivor
                    </span>
                    <span className="roboto text-xs text-gray-600 group-hover:text-gray-400 tracking-wider uppercase mt-1 z-10 transition-colors duration-200">
                        Randomize loadout
                    </span>
                </button>
            </div>
        </div>
    )
}