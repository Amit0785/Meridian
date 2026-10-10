import { Request, Response } from 'express';
import { TestRunnerService } from '../Services/testRunnerService';
import { catchAsync } from '../utils/catchAsync';
import { status } from '../utils/status';

/**
 * Execute automated Unit & Integration test suite
 */
export const runSuite = catchAsync(async (_req: Request, res: Response) => {
  const report = await TestRunnerService.runFullSuite();
  res.status(status.OK).json({
    success: true,
    statusCode: status.OK,
    message: `Executed ${report.totalTests} tests (${report.passedCount} passed, ${report.failedCount} failed)`,
    data: report,
  });
});

// Backward compatibility controller object
export const TestController = {
  runSuite,
  RunSuite: runSuite,
};

export default TestController;
