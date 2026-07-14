import { CONFIG } from '../../config/config.js';

function getDataUrl(filename) {
  return `data/${filename}`;
}

export async function getCompanies() {
  try {
    const res = await fetch(getDataUrl('companies.json'));
    const data = await res.json();
    return data.companies || [];
  } catch (err) {
    console.error('Error fetching companies:', err);
    return [];
  }
}

export async function getCompanyById(id) {
  const companies = await getCompanies();
  return companies.find(c => c.id === id) || null;
}
