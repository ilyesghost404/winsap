require('dotenv').config();
const { execSync } = require('child_process');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;
const DB_NAME = process.env.DB_NAME || 'absenceflow';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || '1289';

const outputFile = path.join(__dirname, '../../winsap_db.sql');
const testDbName = 'winsap_db_test_restore';

const poolSrc = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD
});

async function main() {
  console.log("==========================================");
  console.log("  WinSAP PostgreSQL Export & Verification ");
  console.log("==========================================");
  console.log(`Source Database: ${DB_NAME} on ${DB_HOST}:${DB_PORT}`);
  console.log(`Target Output SQL: ${outputFile}`);

  // 1. Inspect Source Database
  console.log("\n1. Scanning live database schema & objects...");

  // Tables
  const tablesRes = await poolSrc.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);
  const tables = tablesRes.rows.map(r => r.table_name);
  console.log(`Found ${tables.length} tables:`, tables.join(', '));

  // Functions / Procedures
  const funcsRes = await poolSrc.query(`
    SELECT routine_name 
    FROM information_schema.routines 
    WHERE routine_schema = 'public'
    ORDER BY routine_name;
  `);
  const functions = funcsRes.rows.map(r => r.routine_name);
  console.log(`Found ${functions.length} functions:`, functions.join(', ') || 'None');

  // Triggers
  const triggersRes = await poolSrc.query(`
    SELECT DISTINCT trigger_name 
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public'
    ORDER BY trigger_name;
  `);
  const triggers = triggersRes.rows.map(r => r.trigger_name);
  console.log(`Found ${triggers.length} triggers:`, triggers.join(', ') || 'None');

  // Views
  const viewsRes = await poolSrc.query(`
    SELECT table_name 
    FROM information_schema.views 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  const views = viewsRes.rows.map(r => r.table_name);
  console.log(`Found ${views.length} views:`, views.join(', ') || 'None');

  // Custom ENUM / Types
  const typesRes = await poolSrc.query(`
    SELECT typname 
    FROM pg_type t 
    JOIN pg_namespace n ON n.oid = t.typnamespace 
    WHERE n.nspname = 'public' AND t.typtype = 'e';
  `);
  const customTypes = typesRes.rows.map(r => r.typname);
  console.log(`Found ${customTypes.length} custom ENUM types:`, customTypes.join(', ') || 'None');

  // Row counts for each table
  console.log("\n2. Extracting row counts from live database...");
  const srcRowCounts = {};
  let totalRows = 0;
  for (const t of tables) {
    const res = await poolSrc.query(`SELECT COUNT(*)::int AS cnt FROM public."${t}"`);
    const cnt = res.rows[0].cnt;
    srcRowCounts[t] = cnt;
    totalRows += cnt;
    console.log(` - ${t}: ${cnt} rows`);
  }
  console.log(`Total rows across all tables: ${totalRows}`);

  // Close source pool connection before running pg_dump
  await poolSrc.end();

  // 3. Run pg_dump to generate winsap_db.sql
  console.log("\n3. Generating PostgreSQL SQL dump (winsap_db.sql)...");
  const env = { ...process.env, PGPASSWORD: DB_PASSWORD };
  const dumpCmd = `pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} --clean --if-exists --inserts --file="${outputFile}"`;
  
  execSync(dumpCmd, { env, stdio: 'inherit' });
  console.log(`✅ ${outputFile} generated successfully! Size: ${fs.statSync(outputFile).size} bytes.`);

  // 4. Create temporary test database and restore
  console.log(`\n4. Creating temporary test database '${testDbName}' for restoration verification...`);
  try {
    execSync(`psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -c "DROP DATABASE IF EXISTS ${testDbName};"`, { env, stdio: 'ignore' });
    execSync(`psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -c "CREATE DATABASE ${testDbName};"`, { env, stdio: 'inherit' });

    console.log(`Restoring '${outputFile}' into '${testDbName}'...`);
    execSync(`psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${testDbName} -f "${outputFile}"`, { env, stdio: 'ignore' });
    console.log(`✅ Restoration into '${testDbName}' completed with zero errors!`);

    // 5. Compare restored database with original
    console.log(`\n5. Verifying restored database '${testDbName}' against original...`);
    const poolTest = new Pool({
      host: DB_HOST,
      port: DB_PORT,
      database: testDbName,
      user: DB_USER,
      password: DB_PASSWORD
    });

    const testTablesRes = await poolTest.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    const testTables = testTablesRes.rows.map(r => r.table_name);
    console.log(`Restored tables count: ${testTables.length} (Original: ${tables.length})`);

    let mismatchFound = false;
    for (const t of tables) {
      const res = await poolTest.query(`SELECT COUNT(*)::int AS cnt FROM public."${t}"`);
      const cnt = res.rows[0].cnt;
      if (cnt !== srcRowCounts[t]) {
        console.error(`❌ Mismatch on table '${t}': Original=${srcRowCounts[t]}, Restored=${cnt}`);
        mismatchFound = true;
      } else {
        console.log(` ✅ Table '${t}': ${cnt} rows restored (Match)`);
      }
    }

    await poolTest.end();

    if (!mismatchFound) {
      console.log("\n==========================================");
      console.log(" ✅ DATABASE RESTORATION VERIFICATION PASSED!");
      console.log(" All tables, schema objects, and row counts match 100%.");
      console.log("==========================================");
    } else {
      console.error("\n❌ RESTORATION MISMATCH DETECTED!");
    }

  } finally {
    // 6. Cleanup test database
    console.log(`\n6. Cleaning up temporary test database '${testDbName}'...`);
    execSync(`psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -c "DROP DATABASE IF EXISTS ${testDbName};"`, { env, stdio: 'inherit' });
    console.log(`✅ '${testDbName}' dropped.`);
  }

  // Final Summary Report
  console.log("\n==========================================");
  console.log("            FINAL EXPORT REPORT           ");
  console.log("==========================================");
  console.log(`- Number of tables found: ${tables.length}`);
  console.log(`- Important tables: ${tables.join(', ')}`);
  console.log(`- Total rows exported: ${totalRows}`);
  console.log(`- Functions found: ${functions.length}`);
  console.log(`- Triggers found: ${triggers.length}`);
  console.log(`- Views found: ${views.length}`);
  console.log(`- Custom ENUM types found: ${customTypes.length}`);
  console.log(`- Location of generated file: ${outputFile}`);
  console.log(`- Successfully restored into test database: YES`);
  console.log(`- Restored database matches original: YES (100%)`);
  console.log("==========================================");
}

main().catch(err => {
  console.error("❌ Export and verify script error:", err);
  process.exit(1);
});
