import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const iconsDir = join(projectRoot, 'public', 'icons');

// Ensure icons directory exists
if (!existsSync(iconsDir)) {
    mkdirSync(iconsDir, { recursive: true });
}

const sizes = [48, 72, 96, 128, 144, 152, 192, 256, 384];
const maskableSizes = [192, 512];

async function generateIcons() {
    console.log('🎨 Generating app icons...\n');

    const sourceIcon = join(iconsDir, 'icon-512.png');
    const sourceMaskable = join(iconsDir, 'icon-maskable-512.png');

    // Check if source files exist
    if (!existsSync(sourceIcon)) {
        console.error('❌ Source icon not found:', sourceIcon);
        return;
    }

    // Generate regular icons
    for (const size of sizes) {
        const outputPath = join(iconsDir, `icon-${size}.png`);
        try {
            await sharp(sourceIcon)
                .resize(size, size)
                .png()
                .toFile(outputPath);
            console.log(`✅ Created icon-${size}.png`);
        } catch (err) {
            console.error(`❌ Error creating icon-${size}.png:`, err.message);
        }
    }

    // Generate maskable icons
    if (existsSync(sourceMaskable)) {
        for (const size of maskableSizes) {
            const outputPath = join(iconsDir, `icon-maskable-${size}.png`);
            try {
                await sharp(sourceMaskable)
                    .resize(size, size)
                    .png()
                    .toFile(outputPath);
                console.log(`✅ Created icon-maskable-${size}.png`);
            } catch (err) {
                console.error(`❌ Error creating icon-maskable-${size}.png:`, err.message);
            }
        }
    }

    console.log('\n✨ Icon generation complete!');
}

generateIcons();
