import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCHEMA_PATH = path.resolve(__dirname, '../pawwiz-backend/prisma/schema.prisma');
const OUTPUT_PATH = path.resolve(__dirname, './src/pages/docs/dbSchemaData.json');

const GROUP_MAPPING = {
  Profile: { group: 'Core / Identity', color: '#2ec4b6' },
  OnboardingSession: { group: 'Core / Identity', color: '#2ec4b6' },
  Cat: { group: 'Core / Identity', color: '#2ec4b6' },
  DietProfile: { group: 'Diet Tracking', color: '#e9c46a' },
  DietMealLog: { group: 'Diet Tracking', color: '#e9c46a' },
  BehaviorChat: { group: 'Behavior Decoder', color: '#0f172a' },
  BehaviorMessage: { group: 'Behavior Decoder', color: '#0f172a' },
  BehaviorLog: { group: 'Behavior Decoder', color: '#0f172a' },
  HealthTimelineInsight: { group: 'Health Timeline', color: '#2ec4b6' },
  PregnancySession: { group: 'Pregnancy Tracker', color: '#e9c46a' },
  PregnancyLog: { group: 'Pregnancy Tracker', color: '#e9c46a' },
  PregnancyInsight: { group: 'Pregnancy Tracker', color: '#e9c46a' },
  Plant: { group: 'Content Lookup', color: '#0f172a' },
};

function parseSchema() {
  try {
    const content = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    
    // Strip out comments
    const lines = content.split('\n').map(l => l.replace(/\/\/.*$/, '').trim()).filter(Boolean);

    const models = [];
    let currentModel = null;

    for (const line of lines) {
      if (line.startsWith('model ')) {
        const match = line.match(/^model\s+(\w+)\s*\{/);
        if (match) {
          currentModel = {
            name: match[1],
            table: match[1].toLowerCase(),
            fields: [],
            relations: [],
            rawFields: [],
            indices: new Set(),
            uniques: new Set()
          };
        }
      } else if (line === '}') {
        if (currentModel) {
          models.push(currentModel);
          currentModel = null;
        }
      } else if (currentModel) {
        if (line.startsWith('@@map(')) {
          const match = line.match(/@@map\("([^"]+)"\)/);
          if (match) {
            currentModel.table = match[1];
          }
        } else if (line.startsWith('@@index(')) {
          const match = line.match(/@@index\(\[([^\]]+)\]\)/);
          if (match) {
            match[1].split(',').map(f => f.trim().split('(')[0]).forEach(f => currentModel.indices.add(f));
          }
        } else if (line.startsWith('@@unique(')) {
          const match = line.match(/@@unique\(\[([^\]]+)\]\)/);
          if (match) {
            match[1].split(',').map(f => f.trim()).forEach(f => currentModel.uniques.add(f));
          }
        } else if (!line.startsWith('@@')) {
          const parts = line.split(/\s+/);
          if (parts.length >= 2) {
            const name = parts[0];
            const type = parts[1];
            const rest = parts.slice(2).join(' ');
            currentModel.rawFields.push({ name, type, rest });
          }
        }
      }
    }

    const modelNames = new Set(models.map(m => m.name));

    for (const m of models) {
      const fkFields = new Set();
      for (const rf of m.rawFields) {
        if (rf.rest.includes('@relation')) {
          const match = rf.rest.match(/fields:\s*\[([^\]]+)\]/);
          if (match) {
            match[1].split(',').map(f => f.trim()).forEach(f => fkFields.add(f));
          }
        }
      }

      for (const rf of m.rawFields) {
        const isList = rf.type.endsWith('[]');
        const cleanType = rf.type.replace(/[\[\]\?]/g, '');

        if (modelNames.has(cleanType)) {
          m.relations.push({
            to: cleanType,
            cardinality: isList ? '1:N' : 'N:1',
            label: rf.name
          });
        } else {
          let flag = undefined;
          if (rf.rest.includes('@id')) {
            flag = 'PK';
          } else if (fkFields.has(rf.name)) {
            flag = 'FK';
          } else if (rf.rest.includes('@unique') || m.uniques.has(rf.name)) {
            flag = 'UNIQUE';
          } else if (m.indices.has(rf.name)) {
            flag = 'IDX';
          }

          m.fields.push({
            name: rf.name,
            type: rf.type,
            flag
          });
        }
      }

      delete m.rawFields;
      delete m.indices;
      delete m.uniques;
    }

    const groups = {};
    for (const m of models) {
      const config = GROUP_MAPPING[m.name] || { group: 'Other', color: '#94a3b8' };
      if (!groups[config.group]) {
        groups[config.group] = {
          group: config.group,
          color: config.color,
          models: []
        };
      }
      groups[config.group].models.push(m);
    }

    const result = Object.values(groups);
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`Successfully generated dynamic schema data at: ${OUTPUT_PATH}`);
  } catch (err) {
    console.error(`Failed to parse schema.prisma: ${err.message}`);
  }
}

// Initial execution
parseSchema();

// Watch and concurrent run mode
const args = process.argv.slice(2);
const isWatch = args.includes('--watch');

if (isWatch) {
  let fsTimeout;
  console.log(`Watching schema.prisma for changes at: ${SCHEMA_PATH}`);
  fs.watch(SCHEMA_PATH, (event, filename) => {
    if (!fsTimeout) {
      fsTimeout = setTimeout(() => {
        fsTimeout = null;
        parseSchema();
      }, 200); // debounce 200ms
    }
  });

  // Spawn Vite dev server
  const viteProcess = spawn('npx', ['vite'], { stdio: 'inherit', shell: true });
  viteProcess.on('close', (code) => {
    process.exit(code);
  });
}
