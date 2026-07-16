import fs from 'fs';
import path from 'path';

try {
  const mrisData = JSON.parse(fs.readFileSync('./data/mris.json', 'utf8'));
  const companiesData = JSON.parse(fs.readFileSync('./data/companies.json', 'utf8'));

  let reportMarkdown = `# Growth MRI Validation Report\n\nGenerated automatically on ${new Date().toISOString()}\n\n`;
  reportMarkdown += `| Report URL | Status | Details / Issues |\n`;
  reportMarkdown += `| --- | --- | --- |\n`;

  let totalLoaded = 0;
  let totalFailed = 0;

  mrisData.mris.forEach(mri => {
    const issues = [];
    
    // Required fields check
    if (!mri.id) {
      issues.push("Missing 'id'");
    }
    if (!mri.companyId) {
      issues.push("Missing 'companyId'");
    } else {
      const company = companiesData.companies.find(c => c.id === mri.companyId);
      if (!company) {
        issues.push(`Referenced companyId "${mri.companyId}" not found in companies.json`);
      }
    }
    
    if (!mri.summary) issues.push("Missing 'summary'");
    if (!mri.observations || !Array.isArray(mri.observations) || mri.observations.length === 0) {
      issues.push("Missing or empty 'observations' list");
    }
    if (!mri.constraints || !Array.isArray(mri.constraints) || mri.constraints.length === 0) {
      issues.push("Missing or empty 'constraints' list");
    }
    if (!mri.velocity) issues.push("Missing 'velocity' description");
    if (!mri.validation) issues.push("Missing 'validation' summary");
    if (!mri.experiments || !Array.isArray(mri.experiments) || mri.experiments.length === 0) {
      issues.push("Missing or empty 'experiments' list");
    }

    const url = `case-study.html?id=${mri.id || 'unknown'}`;
    if (issues.length === 0) {
      totalLoaded++;
      reportMarkdown += `| [\`${url}\`](file:///C:/Users/bimal/.gemini/antigravity/scratch/kernmetrics/pages/${url}) | ✓ Loaded | All schema constraints validated successfully. |\n`;
      console.log(`✓ Loaded: ${mri.id}`);
    } else {
      totalFailed++;
      reportMarkdown += `| [\`${url}\`](file:///C:/Users/bimal/.gemini/antigravity/scratch/kernmetrics/pages/${url}) | ✗ Failed | Issues: ${issues.join(', ')} |\n`;
      console.error(`✗ Failed: ${mri.id || 'Unknown ID'} - ${issues.join(', ')}`);
    }
  });

  reportMarkdown += `\n## Validation Summary\n- Total Loaded successfully: ${totalLoaded}\n- Total Failures: ${totalFailed}\n`;

  fs.writeFileSync('C:/Users/bimal/.gemini/antigravity/brain/838e8ae7-f4e9-4040-9de6-c8c36c75a683/mri_validation_report.md', reportMarkdown, 'utf8');
  console.log("\nValidation report saved to artifacts: mri_validation_report.md");
} catch (err) {
  console.error("Critical verification runtime error:", err);
}
