const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 创建images目录（如果不存在）
const imagesDir = path.join(__dirname, '../images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

// 定义图标配置
const icons = {
  'home.png': {
    color: '#999999',
    size: 48,
    path: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'
  },
  'home-active.png': {
    color: '#4CAF50',
    size: 48,
    path: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'
  },
  'profile.png': {
    color: '#999999',
    size: 48,
    path: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
  },
  'profile-active.png': {
    color: '#4CAF50',
    size: 48,
    path: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
  },
  'logo.png': {
    color: '#4CAF50',
    size: 120,
    path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z'
  }
};

// 生成PNG文件
async function generateIcons() {
  for (const [filename, config] of Object.entries(icons)) {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${config.size}" height="${config.size}" viewBox="0 0 24 24">
        <path fill="${config.color}" d="${config.path}"/>
      </svg>
    `;
    
    const tempSvgPath = path.join(imagesDir, `${filename}.svg`);
    fs.writeFileSync(tempSvgPath, svg);
    
    await sharp(tempSvgPath)
      .resize(config.size, config.size)
      .png()
      .toFile(path.join(imagesDir, filename));
    
    fs.unlinkSync(tempSvgPath);
    console.log(`Generated ${filename}`);
  }
}

generateIcons().catch(console.error); 