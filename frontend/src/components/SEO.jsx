import { useEffect } from 'react';

/**
 * SEO Component for dynamic page-level meta tags
 * Works with React 19 without external dependencies
 * 
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description
 * @param {string} props.keywords - Page keywords (comma-separated)
 * @param {string} props.canonicalUrl - Canonical URL for the page
 * @param {string} props.ogType - Open Graph type (default: "website")
 * @param {string} props.ogImage - Open Graph image URL
 */
const SEO = ({
  title = 'Salon Abed - Premium Barbershop & Grooming Services',
  description = 'Experience precision grooming at Salon Abed. Expert barbers offering haircuts, beard trims, and premium styling. Book your appointment online today.',
  keywords = 'barbershop, haircut, grooming, barber, beard trim, Salon Abed',
  canonicalUrl = 'https://bossbarbershop.onrender.com/',
  ogType = 'website',
  ogImage = 'https://bossbarbershop.onrender.com/og-image.png',
}) => {
  useEffect(() => {
    // Update document title
    const fullTitle = title.includes('Salon Abed') ? title : `${title} | Salon Abed`;
    document.title = fullTitle;

    // Helper function to update or create meta tags
    const updateMetaTag = (selector, attribute, value) => {
      let element = document.querySelector(selector);
      if (element) {
        element.setAttribute(attribute, value);
      } else {
        element = document.createElement('meta');
        const [attr, attrValue] = selector.replace('meta[', '').replace(']', '').split('=');
        element.setAttribute(attr, attrValue.replace(/"/g, ''));
        element.setAttribute(attribute, value);
        document.head.appendChild(element);
      }
    };

    // Update primary meta tags
    updateMetaTag('meta[name="description"]', 'content', description);
    updateMetaTag('meta[name="keywords"]', 'content', keywords);
    updateMetaTag('meta[name="title"]', 'content', fullTitle);

    // Update Open Graph tags
    updateMetaTag('meta[property="og:title"]', 'content', fullTitle);
    updateMetaTag('meta[property="og:description"]', 'content', description);
    updateMetaTag('meta[property="og:url"]', 'content', canonicalUrl);
    updateMetaTag('meta[property="og:type"]', 'content', ogType);
    updateMetaTag('meta[property="og:image"]', 'content', ogImage);
    updateMetaTag('meta[property="og:image:secure_url"]', 'content', ogImage);

    // Update Twitter Card tags
    updateMetaTag('meta[name="twitter:title"]', 'content', fullTitle);
    updateMetaTag('meta[name="twitter:description"]', 'content', description);
    updateMetaTag('meta[name="twitter:url"]', 'content', canonicalUrl);
    updateMetaTag('meta[name="twitter:image"]', 'content', ogImage);

    // Update canonical URL
    let canonicalElement = document.querySelector('link[rel="canonical"]');
    if (canonicalElement) {
      canonicalElement.setAttribute('href', canonicalUrl);
    } else {
      canonicalElement = document.createElement('link');
      canonicalElement.setAttribute('rel', 'canonical');
      canonicalElement.setAttribute('href', canonicalUrl);
      document.head.appendChild(canonicalElement);
    }

    // Cleanup function to reset to defaults when component unmounts
    return () => {
      document.title = 'Salon Abed - Premium Barbershop & Grooming Services';
    };
  }, [title, description, keywords, canonicalUrl, ogType, ogImage]);

  // This component doesn't render anything
  return null;
};

export default SEO;
