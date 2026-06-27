import { afterEach } from 'vitest';

afterEach(({ task }) => {
  if (task.result?.state === 'fail') {
    console.log(`\n [X] Test Failed: ${task.name}`);
    task.result.errors?.forEach(err => {
      // Catch the error object and pretty-print only that specific payload
      console.dir(err, { depth: null, colors: true });
    });
  }
});
