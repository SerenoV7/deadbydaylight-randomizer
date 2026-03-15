/* eslint-disable @typescript-eslint/no-unused-vars */
/*

This script's purpose is to fetch the data required for the application to work.
It is a required part of the setup process to ensure that the project works correctly.

*/

import { writeFile, mkdir } from 'node:fs/promises';

// --- Perks ---
interface Perk {
  categories: string[];
  name: string;
  description: string;
  role: string;
  character: number;
  tunables?: string[][] | string[];
  teachable: number;
  image: string;
}

interface TransformedPerk {
  name: string;
  description: string;
  role: string;
  image: string;
}

// --- Items ---
interface Item {
  type: string;
  item_type: string | null;
  name: string;
  description: string;
  role: string;
  modifiers: unknown | null;
  bloodweb: number;
  event: unknown | null;
  rarity: string;
  image: string;
}

interface TransformedItem {
  item_type: string | null;
  name: string;
  description: string;
  rarity: string;
  image: string;
}

// --- Addons ---
interface Addon {
  type: string;
  item_type: string | null;
  parents: string[];
  name: string;
  description: string;
  role: string;
  modifiers: unknown | null;
  bloodweb: number;
  rarity: string;
  image: string;
}

interface TransformedAddon {
  type: string;
  item_type: string | null;
  parents: string[];
  name: string;
  description: string;
  role: string;
  rarity: string;
  image: string;
}

// --- Characters ---
interface Character {
  id: string;
  name: string;
  role: string;
  difficulty: string;
  gender: string;
  height: string;
  bio: string;
  story: string;
  image: string;
  abilities: unknown;
  tunables: Record<string, number>;
  item: string;
  outfit: string[];
  dlc: unknown;
  perks: string[];
}

interface TransformedCharacter {
  image: string;
  item: string;
}

// --- Fetch and Transform Perks ---
async function fetchPerks(url: string): Promise<Record<string, Perk>> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch perks: ${response.statusText}`);
  return response.json();
}

function transformDescription(description: string | null, tunables: string[] | string[][] = []): string {
  if (description === null) return '';
  const safeTunables = Array.isArray(tunables) ? tunables.map(t => Array.isArray(t) ? t : [t]) : [];
  let transformed = description;
  safeTunables.forEach((tunable, index) => {
    const placeholder = `{${index}}`;
    if (tunable && tunable.length > 0) {
      if (tunable.length === 1) {
        transformed = transformed.replace(placeholder, `<span class="green">${tunable[0]}</span>`);
      } else if (tunable.length === 3) {
        transformed = transformed.replace(
          placeholder,
          `<span class="green">${tunable[0]}</span>/<span class="blue">${tunable[1]}</span>/<span class="purple">${tunable[2]}</span>`
        );
      }
    }
  });
  return transformed
    .replace(/<br>/g, '<br />')
    .replace(/<b>/g, '<strong>')
    .replace(/<\/b>/g, '</strong>')
    .replace(/\./g, '. ');
}

function transformPerk(key: string, perk: Perk): TransformedPerk {
  const { categories, character, teachable, tunables, ...rest } = perk;
  const safeTunables = Array.isArray(tunables) ? tunables : [];
  const description = transformDescription(perk.description, safeTunables);
  const imagePath = perk.image.replace('/Game/UI/UMGAssets/Icons/', '/icons/');
  const image = imagePath.replace(/iconPerks_([a-z])/g, (match, p1) => `iconPerks_${p1.toUpperCase()}`) + '.png';
  return { name: rest.name, description, role: rest.role, image };
}

// --- Fetch and Transform Addons ---
async function fetchAddons(url: string): Promise<Record<string, Addon>> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch addons: ${response.statusText}`);
  return response.json();
}

function transformAddon(key: string, addon: Addon): TransformedAddon {
  const { bloodweb, modifiers, ...rest } = addon;
  const description = transformDescription(addon.description, []);
  const imagePath = addon.image.replace('/Game/UI/UMGAssets/Icons/', '/icons/');
  const image = imagePath.replace(/\/icons\/([a-z])/, (match, p1) => `/icons/${p1.toUpperCase()}`) + '.png';
  return { ...rest, name: rest.name, description, image };
}

// --- Fetch and Transform Items ---
async function fetchItems(url: string): Promise<Record<string, Item>> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch items: ${response.statusText}`);
  return response.json();
}

function transformItem(key: string, item: Item): TransformedItem {
  const { type, modifiers, bloodweb, event, ...rest } = item;
  const description = transformDescription(item.description, []);
  const imagePath = item.image.replace('/Game/UI/UMGAssets/Icons/', '/icons/');
  const image = imagePath.replace(/\/icons\/([a-z])/, (match, p1) => `/icons/${p1.toUpperCase()}`) + '.png';
  return { item_type: rest.item_type, name: rest.name, description, rarity: rest.rarity, image };
}

// --- Fetch and Transform Characters ---
async function fetchCharacters(url: string): Promise<Record<string, Character>> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch characters: ${response.statusText}`);
  return response.json();
}

  function transformCharacter(character: Character): TransformedCharacter {
    if (character.role === 'killer') {
      const image = character.image.replace('UI/Icons', '/icons');
      return { image, item: character.item };
    } else {
      return { image: '', item: '' };
    }
  }

async function main() {

  const url = 'https://dbd.tricky.lol/api/'
  const dataDir = './public/data/'

  await mkdir(dataDir, { recursive: true });

  const perks = await fetchPerks(url+'perks');
  const transformed_perks: Record<string, TransformedPerk> = {};

  for (const [key, perk] of Object.entries(perks)) {
    let newKey = key.replace(/_/g, ' ');
    newKey = newKey.replace(/ /g, "");
    transformed_perks[newKey] = transformPerk(key, perk);
  }

  await writeFile(`${dataDir}perks.json`, JSON.stringify(transformed_perks));
  console.log('Perks transformed and saved to json');

  const characters = await fetchCharacters(url+'characters');
  const transformed_characters: Record<string, TransformedCharacter> = {};

  for (const [_, character] of Object.entries(characters)) {
    if (character.role?.toLowerCase().includes('survivor')) continue;

    const name = character.name;
    transformed_characters[name] = transformCharacter(character);
  }

  await writeFile(`${dataDir}characters.json`, JSON.stringify(transformed_characters));
  console.log('Characters transformed and saved to json');

  const items = await fetchItems(url+'items');
  const transformed_items: Record<string, TransformedItem> = {};

  for (const [key, item] of Object.entries(items)) {
    if (item.role === 'killer') continue;

    transformed_items[key] = transformItem(key, item);
  }

  await writeFile(`${dataDir}items.json`, JSON.stringify(transformed_items));
  console.log('Items transformed and saved to json');

  const addons = await fetchAddons(url+'addons');
  const transformed_addons: Record<string, TransformedAddon> = {};

  for (const [key, addon] of Object.entries(addons)) {
    transformed_addons[key] = transformAddon(key, addon);
  }

  await writeFile(`${dataDir}addons.json`, JSON.stringify(transformed_addons));
  console.log('Addons transformed and saved to json');
}

main().catch(console.error);

export {}