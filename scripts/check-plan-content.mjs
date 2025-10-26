import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables manually
const envPath = join(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get plan ID from command line argument or use default
const planId = process.argv[2] || 'ab979658-2e23-4d42-8d06-00d46cf863fe';
console.log('Checking plan ID:', planId);

const { data: plan, error } = await supabase
  .from('emergency_plans')
  .select('*')
  .eq('id', planId)
  .single();

if (error) {
  console.error('Error fetching plan:', error);
  process.exit(1);
}

console.log('=== PLAN METADATA ===');
console.log(`Facility: ${plan.facility_name}`);
console.log(`Status: ${plan.status}`);
console.log(`Version: ${plan.version}`);
console.log(`Created: ${plan.created_at}`);

const content = plan.content_json || {};

console.log('\n=== CONTENT STRUCTURE ===');
console.log(`Has sections: ${!!content.sections}`);
console.log(`Number of sections: ${content.sections?.length || 0}`);
console.log(`Has executive summary: ${!!content.executiveSummary}`);
console.log(`Executive summary length: ${content.executiveSummary?.length || 0}`);

console.log('\n=== SECTION DETAILS ===');
if (content.sections) {
  content.sections.forEach((section, index) => {
    console.log(`\n[${index}] ${section.title}`);
    console.log(`  Content length: ${section.content?.length || 0}`);
    if (section.content && section.content.length > 0) {
      console.log(`  First 200 chars: ${section.content.substring(0, 200)}...`);
    } else {
      console.log(`  ⚠️  EMPTY CONTENT`);
    }
    if (section.subsections) {
      console.log(`  Subsections: ${section.subsections.length}`);
      section.subsections.forEach((sub, subIndex) => {
        console.log(`    [${subIndex}] ${sub.title} (${sub.content?.length || 0} chars)`);
      });
    }
  });
}

console.log('\n=== TESTING CONTACT EXTRACTION ===');
const contactSection = content.sections?.find(s => s.title.toLowerCase().includes('contact'));

// Simulate what the server does
const getContactSection = () => {
  const found = contactSection;
  if (!found) return undefined;

  if (found.subsections && found.subsections.length > 0) {
    return {
      ...found,
      content: found.subsections
        .map(sub => sub.content)
        .join('\n\n')
    };
  }
  return found;
};

const combinedContactSection = getContactSection();

console.log('Combined contact content length:', combinedContactSection?.content?.length || 0);
console.log('\nFirst 1000 chars of combined content:');
console.log(combinedContactSection?.content?.substring(0, 1000));

// Test the parser logic
const parseContacts = (content) => {
  const contacts = [];
  const lines = content.split("\n");
  let phoneColumnIndex = -1;
  let serviceColumnIndex = -1;
  let companyColumnIndex = -1;

  for (const line of lines) {
    if (line.includes("|") && !line.match(/^[-:|]+$/)) {
      const cells = line.split("|").map((c) => c.trim()).filter(Boolean);

      if (cells[0]?.toLowerCase().includes("service") ||
          cells[0]?.toLowerCase().includes("role")) {
        serviceColumnIndex = 0;
        for (let i = 0; i < cells.length; i++) {
          const header = cells[i].toLowerCase();
          if (header.includes("phone") || header.includes("number") || header.includes("contact")) {
            phoneColumnIndex = i;
          }
          if (header.includes("company")) {
            companyColumnIndex = i;
          }
        }
        continue;
      }

      if (serviceColumnIndex >= 0 && phoneColumnIndex >= 0 && cells.length > phoneColumnIndex) {
        const service = cells[serviceColumnIndex];
        const phone = cells[phoneColumnIndex];
        const company = companyColumnIndex >= 0 ? cells[companyColumnIndex] : undefined;

        if (service && phone &&
            !phone.includes("[") &&
            !phone.toLowerCase().includes("phone") &&
            phone.trim().length > 0) {

          const displayName = company && company.trim().length > 0 && !company.includes("[")
            ? company
            : service;

          contacts.push({
            service: displayName,
            phone,
            company
          });
        }
      }
    }
  }

  return contacts.slice(0, 8);
};

console.log('\n=== PARSED CONTACTS ===');
const parsedContacts = parseContacts(combinedContactSection?.content || '');
parsedContacts.forEach(c => {
  console.log(`${c.service}: ${c.phone}`);
});

process.exit(0);
