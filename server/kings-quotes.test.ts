import { describe, it, expect } from 'vitest';
import { generateKingsQuotesPage } from './introPages';
import fs from 'fs';

describe('Kings Quotes Page - Images Test', () => {
  it('should embed all 3 king images as base64', () => {
    const html = generateKingsQuotesPage();
    
    // Save for manual inspection
    fs.writeFileSync('/home/ubuntu/kings-quotes-output.html', html);
    
    // Check for base64 images
    const base64Images = html.match(/data:image\/[^;]+;base64,[^"]+/g) || [];
    
    console.log(`\n📊 Found ${base64Images.length} base64 images`);
    
    // Should have exactly 3 images (one for each king)
    expect(base64Images.length).toBe(3);
    
    // Check that each image is substantial (not empty)
    base64Images.forEach((img, index) => {
      const base64Data = img.split(',')[1];
      expect(base64Data.length).toBeGreaterThan(1000); // At least 1KB
      console.log(`  Image ${index + 1}: ${(base64Data.length / 1024).toFixed(1)} KB`);
    });
    
    // Check for king names
    expect(html).toContain('الملك عبدالعزيز');
    expect(html).toContain('الملك سلمان');
    expect(html).toContain('محمد بن سلمان');
    
    console.log('✅ All king images are properly embedded!');
  });
  
  it('should have proper image styling', () => {
    const html = generateKingsQuotesPage();
    
    // Check for image class
    expect(html).toContain('king-image');
    
    // Check for image styling
    expect(html).toContain('width: 120px');
    expect(html).toContain('height: 120px');
    expect(html).toContain('border-radius: 50%');
    expect(html).toContain('border: 4px solid #f59e0b');
  });
});
