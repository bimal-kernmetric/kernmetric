// Verification script for KernMetric Platform v1 Knowledge Graph
import fs from 'fs';
import path from 'path';

const DATA_DIR = './data';

function runValidation() {
  console.log('--- STARTING KERNMETRIC KNOWLEDGE GRAPH INTEGRITY CHECK ---');
  
  try {
    // 1. Read and parse all files
    const companiesData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'companies.json'), 'utf8'));
    const mrisData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'mris.json'), 'utf8'));
    const paradoxesData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'paradoxes.json'), 'utf8'));
    const researchData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'research.json'), 'utf8'));
    const relationshipsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'relationships.json'), 'utf8'));

    const companyIds = new Set(companiesData.companies.map(c => c.id));
    const mriIds = new Set(mrisData.mris.map(m => m.id));
    const paradoxIds = new Set(paradoxesData.paradoxes.map(p => p.id));
    const researchIds = new Set(researchData.research.map(r => r.id));

    console.log(`\nFound entities count:`);
    console.log(`- Companies: ${companyIds.size}`);
    console.log(`- Growth MRIs: ${mriIds.size}`);
    console.log(`- Paradoxes: ${paradoxIds.size}`);
    console.log(`- Research Papers: ${researchIds.size}`);

    let errors = 0;

    // 2. Validate MRI links to Companies
    mrisData.mris.forEach(mri => {
      if (!companyIds.has(mri.companyId)) {
        console.error(`ERROR: MRI "${mri.id}" references non-existent companyId "${mri.companyId}"`);
        errors++;
      }
    });

    // 3. Validate Relationships Graph Links
    relationshipsData.relationships.forEach((rel, idx) => {
      const allIds = new Set([...companyIds, ...paradoxIds, ...researchIds]);
      
      if (!allIds.has(rel.source)) {
        console.error(`ERROR: Relationship [${idx}] references non-existent source ID "${rel.source}"`);
        errors++;
      }
      if (!allIds.has(rel.target)) {
        console.error(`ERROR: Relationship [${idx}] references non-existent target ID "${rel.target}"`);
        errors++;
      }
    });

    console.log('\n--- VERIFICATION COMPLETED ---');
    if (errors === 0) {
      console.log('STATUS: SUCCESS. Knowledge Graph links are 100% integral. Zero orphans.');
      process.exit(0);
    } else {
      console.error(`STATUS: FAILED with ${errors} linking errors.`);
      process.exit(1);
    }

  } catch (err) {
    console.error('FATAL SYSTEM ERROR DURING INTEGRITY CHECK:', err.message);
    process.exit(1);
  }
}

runValidation();
