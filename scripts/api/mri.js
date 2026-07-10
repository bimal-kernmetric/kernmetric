function getDataUrl(filename) {
  const path = window.location.pathname;
  if (path.includes('/pages/')) {
    return `../data/${filename}`;
  }
  return `data/${filename}`;
}

export async function getMRIs() {
  try {
    const res = await fetch(getDataUrl('mris.json'));
    const data = await res.json();
    return data.mris || [];
  } catch (err) {
    console.error('Error fetching MRIs:', err);
    return [];
  }
}

export async function getMRIById(id) {
  const mris = await getMRIs();
  return mris.find(m => m.id === id) || null;
}

export async function getMRIForCompany(companyId) {
  const mris = await getMRIs();
  return mris.find(m => m.companyId === companyId) || null;
}
