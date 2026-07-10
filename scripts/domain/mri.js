import { getCompanyById } from '../api/companies.js';

export class MRI {
  constructor(data) {
    Object.assign(this, data);
  }

  async getCompany() {
    return await getCompanyById(this.companyId);
  }

  isHighConfidence() {
    return this.confidence >= 85;
  }

  getValidationStatusDetails() {
    return {
      status: this.status,
      confidence: `${this.confidence}%`,
      validationState: this.validationState,
      version: `v${this.version}`,
      lastUpdated: this.lastUpdated
    };
  }
}
