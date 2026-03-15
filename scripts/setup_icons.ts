/*

This script's purpose is to fetch the default icons from Nightlight and extract them into the `assets/icons` directory.
It is a required part of the setup process to ensure that the project works correctly.

*/

import https from 'https';
import fs from 'fs/promises';
import path from 'path';
import AdmZip from 'adm-zip';

const zipUrl = 'https://file.serenodev.com/misc/dbdrando/default-icons.zip';
const zipPath = './public/icons/default-icons.zip';
const unpackDir = './public/icons/';

// Helper function to download file
async function downloadFile(url: string, filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          downloadFile(response.headers.location as string, filePath).then(resolve).catch(reject);
          return;
        }
        const chunks: Buffer[] = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', async () => {
          try {
            await fs.writeFile(filePath, Buffer.concat(chunks));
            resolve();
          } catch (err) {
            reject(err);
          }
        });
        response.on('error', reject);
      })
      .on('error', reject);
  });
}

// Helper function to remove directory recursively
async function removeDir(dirPath: string): Promise<void> {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch {
    // Directory doesn't exist, ignore
  }
}

console.clear();

// Create directory if it doesn't exist
await fs.mkdir(unpackDir, { recursive: true });

// Download the ZIP file
console.log('Downloading icons...');
await downloadFile(zipUrl, zipPath);

// Extract the ZIP file
console.log('Extracting icons...');
const zip = new AdmZip(zipPath);
zip.extractAllTo(unpackDir, true);

// Remove the ZIP file
await fs.unlink(zipPath);

// Remove unwanted directories
const dirsToRemove = [
  'Actions',
  'Archive',
  'DailyRituals',
  'Emblems',
  'Favors',
  'Powers',
  'StoreBackgrounds',
  'StatusEffects',
];

for (const dir of dirsToRemove) {
  await removeDir(path.join(unpackDir, dir));
}

// Move specific files from HelpLoading
const survivorSrc = path.join(unpackDir, 'HelpLoading/T_UI_iconHelpLoading_survivor.png');
const survivorDest = path.join(unpackDir, 'survivor.png');
const killerSrc = path.join(unpackDir, 'HelpLoading/T_UI_iconHelpLoading_killer.png');
const killerDest = path.join(unpackDir, 'killer.png');

await fs.rename(survivorSrc, survivorDest);
await fs.rename(killerSrc, killerDest);

// Remove HelpLoading directory
await removeDir(path.join(unpackDir, 'HelpLoading'));

// Rename perk icon files - capitalize first letter after underscore
const perksDir = path.join(unpackDir, 'Perks');
try {
  async function renameFilesRecursively(dir: string): Promise<void> {
    const files = await fs.readdir(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isDirectory()) {
        // Recursively process subdirectories
        await renameFilesRecursively(filePath);
      } else if (stat.isFile() && file.endsWith('.png')) {
        // Process PNG files
        const match = file.match(/^(iconPerks_)(.)(.*\.png)$/);
        if (match) {
          const [, prefix, firstLetter, suffix] = match;
          const newName = prefix + firstLetter.toUpperCase() + suffix;
          if (file !== newName) {
            await fs.rename(filePath, path.join(dir, newName));
          }
        }
      }
    }
  }
  
  await renameFilesRecursively(perksDir);
} catch {
  // Perks directory might not exist, ignore
}

console.clear();
console.log('Icons setup complete!');

export {}