import { getRelationships } from '../api/paradoxes.js';
import { getCompanies } from '../api/companies.js';
import { getResearch } from '../api/research.js';

export class Paradox {
  constructor(data) {
    Object.assign(this, data);
  }

  async getConnectedCompanies() {
    const relations = await getRelationships();
    const companyRelations = relations.filter(r => r.target === this.id && r.relationship === 'diagnosed_with');
    const companyIds = companyRelations.map(r => r.source);
    const allCompanies = await getCompanies();
    return allCompanies.filter(c => companyIds.includes(c.id));
  }

  async getConnectedResearch() {
    const relations = await getRelationships();
    const researchRelations = relations.filter(r => r.source === this.id && r.relationship === 'supported_by');
    const researchIds = researchRelations.map(r => r.target);
    const allResearch = await getResearch();
    return allResearch.filter(res => researchIds.includes(res.id));
  }
}
