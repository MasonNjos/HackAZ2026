import React from 'react';

const bannerResources = [
  {
    title: 'Banner Health Services',
    description: 'Browse core care options like primary care, urgent care, imaging, surgery, and specialty medicine.',
    href: 'https://www.bannerhealth.com/en/services',
  },
  {
    title: 'Patients & Visitors',
    description: 'Find patient tools such as billing, medical records, the Banner app, symptom checker, and more.',
    href: 'https://www.bannerhealth.com/Patients',
  },
  {
    title: 'Patient Account',
    description: 'Manage appointments, view records, message your care team, and request prescription renewals.',
    href: 'https://www.bannerhealth.com/patients/patient-account',
  },
  {
    title: 'Health & Wellness',
    description: 'Explore education, health checks, support groups, and prevention resources from Banner Health.',
    href: 'https://www.bannerhealth.com/staying-well/health-and-wellness/wellness',
  },
];

const BannerResources = ({ title = 'Explore Banner Health', compact = false }) => {
  return (
    <section className={`banner-resources ${compact ? 'banner-resources--compact' : ''}`}>
      <div className="banner-resources__header">
        <h3>{title}</h3>
        <p>Quick links to services and patient tools from Banner Health.</p>
      </div>

      <div className="banner-resources__grid">
        {bannerResources.map((resource) => (
          <a
            key={resource.href}
            className="banner-resource-card"
            href={resource.href}
            target="_blank"
            rel="noreferrer"
          >
            <span className="banner-resource-card__title">{resource.title}</span>
            <span className="banner-resource-card__description">{resource.description}</span>
            <span className="banner-resource-card__link">Open Banner Health</span>
          </a>
        ))}
      </div>
    </section>
  );
};

export default BannerResources;
