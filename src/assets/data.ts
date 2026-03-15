
export interface Killer {
  image: string
  item: string
}

export interface SurvivorItem {
  name: string
  item_type: string
}

export interface KillerResult {
    name: string
    addons: string[]
    perks: string[]
}

export interface SurvivorResult {
  item: string
  addons: string[]
  perks: string[]
}