const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets', 'images', 'onboarding');

// Create the directory if it doesn't exist
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create three simple SVG images for onboarding
const onboardingImages = [
  {
    name: 'onboarding-1.svg',
    content: `
      <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="300" rx="150" fill="#E3F2FD"/>
        <path d="M150 100L175 150H125L150 100Z" fill="#1976D2"/>
        <circle cx="150" cy="200" r="20" fill="#1976D2"/>
        <text x="150" y="270" text-anchor="middle" font-family="Arial" font-size="24" fill="#1976D2">1</text>
      </svg>
    `
  },
  {
    name: 'onboarding-2.svg',
    content: `
      <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="300" rx="150" fill="#E8F5E9"/>
        <circle cx="120" cy="150" r="40" fill="#4CAF50"/>
        <circle cx="180" cy="150" r="40" fill="#4CAF50"/>
        <text x="150" y="270" text-anchor="middle" font-family="Arial" font-size="24" fill="#4CAF50">2</text>
      </svg>
    `
  },
  {
    name: 'onboarding-3.svg',
    content: `
      <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="300" rx="150" fill="#FFF3E0"/>
        <path d="M150 120L170 160H130L150 120Z" fill="#FF9800"/>
        <path d="M150 180L170 140H130L150 180Z" fill="#FF9800"/>
        <text x="150" y="270" text-anchor="middle" font-family="Arial" font-size="24" fill="#FF9800">3</text>
      </svg>
    `
  }
];

// Generate the SVG files
onboardingImages.forEach(image => {
  const filePath = path.join(assetsDir, image.name);
  fs.writeFileSync(filePath, image.content.trim());
  console.log(`Created: ${filePath}`);
});

console.log('Onboarding images generated successfully!');
