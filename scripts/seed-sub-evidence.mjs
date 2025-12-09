import mysql from "mysql2/promise";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

// Parse connection string
const url = new URL(DATABASE_URL);
const connection = await mysql.createConnection({
  host: url.hostname,
  port: url.port || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: {
    rejectUnauthorized: true,
  },
});

// Read and parse CSV
const csvPath = join(__dirname, "../../evidence_mapping.csv");
const csvContent = readFileSync(csvPath, "utf-8");
const lines = csvContent.trim().split("\n");

// Skip header
const dataLines = lines.slice(1);

// Parse CSV data
const evidenceData = dataLines.map((line) => {
  const parts = line.split(",");
  return {
    parentTitle: parts[0]?.trim(),
    code: parts[1]?.trim(),
    title: parts[2]?.trim(),
    subject: parts[3]?.trim(),
    grade: parts[4]?.trim(),
    semester: parts[5]?.trim(),
    stage: parts[6]?.trim(),
    track: parts[7]?.trim(),
  };
});

console.log(`Parsed ${evidenceData.length} evidence items from CSV`);

// Group by parent title
const groupedData = {};
evidenceData.forEach((item) => {
  if (!groupedData[item.parentTitle]) {
    groupedData[item.parentTitle] = [];
  }
  groupedData[item.parentTitle].push(item);
});

console.log("Grouped data:");
Object.keys(groupedData).forEach((key) => {
  console.log(`  ${key}: ${groupedData[key].length} items`);
});

// Function to add parent evidence template
async function addParentEvidence(title, standardId) {
  console.log(`\nAdding parent evidence: ${title}`);
  
  // Check if already exists
  const [existing] = await connection.execute(
    `SELECT id FROM evidenceTemplates WHERE title = ? AND standardId = ?`,
    [title, standardId]
  );
  
  if (existing.length > 0) {
    console.log(`  Already exists with ID: ${existing[0].id}`);
    return existing[0].id;
  }
  
  // Get max orderIndex for this standard
  const [maxOrder] = await connection.execute(
    `SELECT MAX(orderIndex) as maxOrder FROM evidenceTemplates WHERE standardId = ?`,
    [standardId]
  );
  const nextOrder = (maxOrder[0]?.maxOrder || 0) + 1;
  
  // Insert parent evidence
  const [result] = await connection.execute(
    `INSERT INTO evidenceTemplates (standardId, title, description, evidenceType, orderIndex, createdAt, updatedAt) 
     VALUES (?, ?, ?, 'general', ?, NOW(), NOW())`,
    [standardId, title, `شواهد ${title}`, nextOrder]
  );
  
  console.log(`  Created with ID: ${result.insertId}`);
  return result.insertId;
}

// Function to add sub-evidence items
async function addSubEvidence(parentId, standardId, items) {
  console.log(`\nAdding ${items.length} sub-evidence items...`);
  
  let added = 0;
  let skipped = 0;
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    // Check if already exists
    const [existing] = await connection.execute(
      `SELECT id FROM evidenceSubTemplates WHERE evidenceTemplateId = ? AND title = ?`,
      [parentId, item.title]
    );
    
    if (existing.length > 0) {
      skipped++;
      continue;
    }
    
    // Prepare JSON arrays
    const subjects = item.subject && item.subject !== "عام" ? JSON.stringify([item.subject]) : null;
    const grades = item.grade ? JSON.stringify([item.grade]) : null;
    const stages = item.stage ? JSON.stringify([item.stage]) : null;
    const semesters = item.semester ? JSON.stringify([item.semester]) : null;
    const tracks = item.track ? JSON.stringify([item.track]) : null;
    
    // Insert sub-evidence
    await connection.execute(
      `INSERT INTO evidenceSubTemplates 
       (evidenceTemplateId, standardId, title, description, applicableSubjects, applicableGrades, applicableStages, applicableSemesters, applicableTracks, orderIndex, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [parentId, standardId, item.title, `${item.code} - ${item.title}`, subjects, grades, stages, semesters, tracks, i + 1]
    );
    
    added++;
    
    if ((i + 1) % 10 === 0) {
      console.log(`  Progress: ${i + 1}/${items.length}`);
    }
  }
  
  console.log(`  Added: ${added}, Skipped: ${skipped}`);
}

// Main execution
async function main() {
  try {
    console.log("Starting seed process...\n");
    
    // Standard 3: "التفاعل مع المجتمع المهني"
    const standardId = 3;
    
    // Add "تبادل الخبرات بين الزملاء"
    if (groupedData["تبادل الخبرات بين الزملاء"]) {
      const parentId1 = await addParentEvidence("تبادل الخبرات بين الزملاء", standardId);
      await addSubEvidence(parentId1, standardId, groupedData["تبادل الخبرات بين الزملاء"]);
    }
    
    // Add "مجتمعات التعلّم المهنية"
    if (groupedData["مجتمعات التعلّم المهنية"]) {
      const parentId2 = await addParentEvidence("مجتمعات التعلّم المهنية", standardId);
      await addSubEvidence(parentId2, standardId, groupedData["مجتمعات التعلّم المهنية"]);
    }
    
    console.log("\n✅ Seed process completed successfully!");
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error during seed process:", error);
    await connection.end();
    process.exit(1);
  }
}

main();
