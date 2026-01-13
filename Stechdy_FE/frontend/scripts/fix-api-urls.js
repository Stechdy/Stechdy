// Script to replace all hardcoded localhost:3001 URLs with config.apiUrl
// Run this to find all remaining hardcoded URLs

const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/pages/StudyTracker/StudyTracker.jsx',
  'src/pages/SlotDetail/SlotDetail.jsx',
  'src/pages/SubjectDetail/SubjectDetail.jsx',
  'src/components/study/StudyTimer.jsx',
  'src/components/payment/PaymentModal.jsx',
  'src/pages/Admin/AdminPayments.jsx'
];

const frontendDir = path.join(__dirname, '..');

filesToFix.forEach(file => {
  const filePath = path.join(frontendDir, file);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if config is already imported
    const hasConfigImport = content.includes('import config from');
    
    // Replace all localhost:3001 URLs
    const modified = content.replace(/http:\/\/localhost:3001\/api/g, '${config.apiUrl}');
    const modified2 = modified.replace(/http:\/\/localhost:3001/g, '${config.apiUrl.replace(\'/api\', \'\')}');
    
    // Add config import if not present and file was modified
    if (!hasConfigImport && modified2 !== content) {
      // Find the last import statement
      const importRegex = /import .+ from .+;/g;
      const imports = content.match(importRegex);
      if (imports) {
        const lastImport = imports[imports.length - 1];
        const configImport = '\nimport config from "../../config";';
        modified2 = modified2.replace(lastImport, lastImport + configImport);
      }
    }
    
    if (modified2 !== content) {
      fs.writeFileSync(filePath, modified2);
      console.log(`✅ Fixed: ${file}`);
    } else {
      console.log(`⏭️  Skipped (no changes): ${file}`);
    }
  } else {
    console.log(`❌ Not found: ${file}`);
  }
});

console.log('\n✅ All files processed!');
