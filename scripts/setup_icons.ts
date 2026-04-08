/*

This script's purpose is to fetch the default icons from Nightlight and extract them into the `assets/icons` directory.
It is a required part of the setup process to ensure that the project works correctly.

*/

import https from 'https';
import fs from 'fs/promises';
import path from 'path';
import AdmZip from 'adm-zip';
import sharp from 'sharp';

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

// Helper function to convert PNG files to WebP
async function convertToWebP(dirPath: string): Promise<void> {
  async function convertFilesRecursively(dir: string): Promise<void> {
    const files = await fs.readdir(dir);
    const promises: Promise<void>[] = [];
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isDirectory()) {
        promises.push(convertFilesRecursively(filePath));
      } else if (stat.isFile() && file.toLowerCase().endsWith('.png')) {
        promises.push(
          (async () => {
            try {
              const webpPath = filePath.replace(/\.png$/i, '.webp');
              await sharp(filePath)
                .webp({ quality: 85 })
                .toFile(webpPath);
              await fs.unlink(filePath);
            } catch (error) {
              console.warn(`Failed to convert ${file} to WebP:`, error);
            }
          })()
        );
      }
    }
    
    await Promise.all(promises);
  }
  
  await convertFilesRecursively(dirPath);
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

// Convert PNG files to WebP
console.log('Converting PNG files to WebP...');
await convertToWebP(unpackDir);

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

await Promise.all(dirsToRemove.map(dir => removeDir(path.join(unpackDir, dir))));

// Move specific files from HelpLoading
const survivorSrc = path.join(unpackDir, 'HelpLoading/T_UI_iconHelpLoading_survivor.webp');
const survivorDest = path.join(unpackDir, 'survivor.webp');
const killerSrc = path.join(unpackDir, 'HelpLoading/T_UI_iconHelpLoading_killer.webp');
const killerDest = path.join(unpackDir, 'killer.webp');

await fs.rename(survivorSrc, survivorDest);
await fs.rename(killerSrc, killerDest);

// Remove HelpLoading directory
await removeDir(path.join(unpackDir, 'HelpLoading'));

// Rename perk icon files - capitalize first letter after underscore
const perksDir = path.join(unpackDir, 'Perks');
try {
  async function renameFilesRecursively(dir: string): Promise<void> {
    const files = await fs.readdir(dir);
    const renamePromises: Promise<void>[] = [];
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isDirectory()) {
        // Recursively process subdirectories
        renamePromises.push(renameFilesRecursively(filePath));
      } else if (stat.isFile() && file.toLowerCase().endsWith('.webp')) {
        // Process WebP files
        const match = file.match(/^(iconPerks_)(.)(.*)\.webp$/i);
        if (match) {
          const [, prefix, firstLetter, suffix] = match;
          const newName = prefix + firstLetter.toUpperCase() + suffix + '.webp';
          if (file !== newName) {
            renamePromises.push(fs.rename(filePath, path.join(dir, newName)));
          }
        }
      }
    }
    
    await Promise.all(renamePromises);
  }
  
  await renameFilesRecursively(perksDir);
} catch {
  // Perks directory might not exist, ignore
}

console.clear();
console.log('Icons setup complete!');

export {}