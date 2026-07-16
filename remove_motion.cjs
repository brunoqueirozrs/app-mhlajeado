const fs = require('fs');
const path = require('path');

const files = [
  'src/components/InstallationsPage.tsx',
  'src/components/InstallationsQueuePage.tsx',
  'src/components/ExternalStorePortal.tsx',
  'src/components/InternalProtocolsPage.tsx',
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/<AnimatePresence>/g, '');
    content = content.replace(/<\/AnimatePresence>/g, '');
    content = content.replace(/<motion\.div[^>]*initial=[^>]*animate=[^>]*>/g, '<div className="fixed inset-0 z-50 flex items-center justify-center p-4">');
    content = content.replace(/<\/motion\.div>/g, '</div>');
    // For other motion.divs
    content = content.replace(/<motion\.div/g, '<div');
    content = content.replace(/<motion\.form/g, '<form');
    content = content.replace(/<\/motion\.form>/g, '</form>');
    content = content.replace(/<motion\.button/g, '<button');
    content = content.replace(/<\/motion\.button>/g, '</button>');
    fs.writeFileSync(file, content, 'utf8');
  }
});
