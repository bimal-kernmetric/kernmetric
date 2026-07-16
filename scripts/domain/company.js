import { getMRIForCompany } from '../api/mri.js';
import { getRelationships, getParadoxes } from '../api/paradoxes.js';

export class Company {
  constructor(data) {
    Object.assign(this, data);
  }

  async getMRI() {
    return await getMRIForCompany(this.id);
  }

  async getDiagnosedParadoxes() {
    const relations = await getRelationships();
    const companyRelations = relations.filter(r => r.source === this.id && r.relationship === 'diagnosed_with');
    const paradoxIds = companyRelations.map(r => r.target);
    const allParadoxes = await getParadoxes();
    return allParadoxes.filter(p => paradoxIds.includes(p.id));
  }
}
