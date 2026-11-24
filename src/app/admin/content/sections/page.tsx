import { getHomepageSections } from '@/lib/cms-homepage';
import { DEFAULT_HOMEPAGE_SECTIONS } from '@/lib/default-homepage-sections';
import ContentSectionsClient from './ContentSectionsClient';

export default async function ContentSectionsPage() {
  const sections = await getHomepageSections(DEFAULT_HOMEPAGE_SECTIONS);
  return <ContentSectionsClient initialSections={sections} />;
}
