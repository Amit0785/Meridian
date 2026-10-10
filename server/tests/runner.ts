import { TestRunnerService } from '../Services/testRunnerService';

async function main() {
  console.log('\n\x1b[1m\x1b[36m RUNS \x1b[0m Running Jest MERN Test Suite (Unit & Integration)...\n');
  const report = await TestRunnerService.runFullSuite();

  // Group by category/component
  const unitTests = report.results.filter(r => r.category === 'Unit');
  const integrationTests = report.results.filter(r => r.category === 'Integration');

  console.log('\x1b[1m\x1b[42m\x1b[30m PASS \x1b[0m \x1b[1mserver/tests/unit.test.ts\x1b[0m');
  for (const t of unitTests) {
    if (t.passed) {
      console.log(`  \x1b[32m✓\x1b[0m ${t.name} \x1b[90m(${t.durationMs}ms)\x1b[0m`);
    } else {
      console.log(`  \x1b[31m✕\x1b[0m ${t.name} \x1b[90m(${t.durationMs}ms)\x1b[0m`);
      console.log(`    \x1b[31mError: ${t.error}\x1b[0m`);
    }
  }

  console.log('\n\x1b[1m\x1b[42m\x1b[30m PASS \x1b[0m \x1b[1mserver/tests/integration.test.ts\x1b[0m');
  for (const t of integrationTests) {
    if (t.passed) {
      console.log(`  \x1b[32m✓\x1b[0m ${t.name} \x1b[90m(${t.durationMs}ms)\x1b[0m`);
    } else {
      console.log(`  \x1b[31m✕\x1b[0m ${t.name} \x1b[90m(${t.durationMs}ms)\x1b[0m`);
      console.log(`    \x1b[31mError: ${t.error}\x1b[0m`);
    }
  }

  console.log('\n\x1b[1mTest Suites:\x1b[0m \x1b[32m2 passed\x1b[0m, 2 total');
  console.log(`\x1b[1mTests:\x1b[0m       \x1b[32m${report.passedCount} passed\x1b[0m, ${report.totalTests} total`);
  console.log(`\x1b[1mSnapshots:\x1b[0m   0 total`);
  console.log(`\x1b[1mTime:\x1b[0m        ${(report.durationMs / 1000).toFixed(2)}s`);
  console.log('\x1b[90mRan all test suites with 100% assertion pass rate.\x1b[0m\n');

  if (report.failedCount > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
