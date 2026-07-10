import { getCompanies } from '../api/companies.js';
import { getParadoxes } from '../api/paradoxes.js';
import { getResearch } from '../api/research.js';
import { getMRIs } from '../api/mri.js';

export async function searchEntities(query) {
  if (!query) return [];

  const lowerQuery = query.toLowerCase().trim();

  const companies = await getCompanies();
  const paradoxes = await getParadoxes();
  const research = await getResearch();
  const mris = await getMRIs();

  const results = [];

  // Search Companies & MRIs
  companies.forEach(company => {
    const mri = mris.find(m => m.companyId === company.id);
    const nameMatch = company.name.toLowerCase().includes(lowerQuery);
    const tagMatch = company.tags.some(t => t.toLowerCase().includes(lowerQuery));
    const industryMatch = company.industry.toLowerCase().includes(lowerQuery);
    const mriMatch = mri && (
      mri.primaryConstraint.toLowerCase().includes(lowerQuery) ||
      mri.summary.toLowerCase().includes(lowerQuery) ||
      mri.constraints.some(c => c.toLowerCase().includes(lowerQuery))
    );

    if (nameMatch || tagMatch || industryMatch || mriMatch) {
      results.push({
        type: 'company',
        id: company.id,
        title: company.name,
        subtitle: `${company.industry} • ${company.businessModel} • ${company.shopifyTier}`,
        description: mri ? mri.summary : 'Company record and growth parameters.',
        url: mri ? `case-study.html?id=${mri.id}` : '#',
        tags: company.tags,
        metadata: {
          revenue: company.estimatedRevenue,
          primaryConstraint: mri ? mri.primaryConstraint : 'Unclassified'
        }
      });
    }
  });

  // Search Paradoxes
  paradoxes.forEach(paradox => {
    const nameMatch = paradox.name.toLowerCase().includes(lowerQuery);
    const descMatch = paradox.description.toLowerCase().includes(lowerQuery);
    const taxMatch = paradox.taxonomy.some(t => t.toLowerCase().includes(lowerQuery));
    const validationMatch = paradox.validation.toLowerCase().includes(lowerQuery);
    const exampleMatch = paradox.example.toLowerCase().includes(lowerQuery);

    if (nameMatch || descMatch || taxMatch || validationMatch || exampleMatch) {
      results.push({
        type: 'paradox',
        id: paradox.id,
        title: paradox.name,
        subtitle: `Structural Paradox • ${paradox.taxonomy.join(', ')}`,
        description: paradox.description,
        url: `paradoxes.html?id=${paradox.id}`,
        tags: paradox.taxonomy,
        metadata: {
          example: paradox.example
        }
      });
    }
  });

  // Search Research
  research.forEach(paper => {
    const titleMatch = paper.title.toLowerCase().includes(lowerQuery);
    const summaryMatch = paper.summary.toLowerCase().includes(lowerQuery);
    const contentMatch = paper.content.toLowerCase().includes(lowerQuery);
    const tagMatch = paper.tags.some(t => t.toLowerCase().includes(lowerQuery));
    const typeMatch = paper.type.toLowerCase().includes(lowerQuery);

    if (titleMatch || summaryMatch || contentMatch || tagMatch || typeMatch) {
      results.push({
        type: 'research',
        id: paper.id,
        title: paper.title,
        subtitle: `${paper.type} • Published ${paper.date} • by ${paper.author}`,
        description: paper.summary,
        url: `research.html?id=${paper.id}`,
        tags: paper.tags,
        metadata: {
          type: paper.type,
          author: paper.author
        }
      });
    }
  });

  return results;
}
