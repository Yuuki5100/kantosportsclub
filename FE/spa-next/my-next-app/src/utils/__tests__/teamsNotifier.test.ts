import { expect, jest } from '@jest/globals';

const loggerMock = {
  error: jest.fn(),
};

const apiPostMock = jest.fn();

jest.mock('@/utils/logger', () => ({
  __esModule: true,
  getLogger: () => loggerMock,
}));

jest.mock('@/api/apiService', () => ({
  __esModule: true,
  apiService: {
    post: apiPostMock,
  },
}));

describe('sendErrorToTeams', () => {
  const OLD_ENV = process.env;
  const error = new Error('Test error');
  const context = 'TestContext';
  let sendErrorToTeams: typeof import('@/utils/teamsNotifier').sendErrorToTeams;

  beforeEach(async () => {
    process.env = { ...OLD_ENV };
    jest.clearAllMocks();
    jest.resetModules();
    sendErrorToTeams = (await import('@/utils/teamsNotifier')).sendErrorToTeams;
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('logs error when TEAMS_WEBHOOK_URL is not defined', async () => {
    delete process.env.TEAMS_WEBHOOK_URL;

    await sendErrorToTeams(error, context);

    expect(loggerMock.error).toHaveBeenCalledWith('TEAMS_WEBHOOK_URL is not defined.');
    expect(apiPostMock).not.toHaveBeenCalled();
  });

  it('calls apiService.post and does not log error when request succeeds', async () => {
    process.env.TEAMS_WEBHOOK_URL = 'https://dummy.webhook';
    apiPostMock.mockResolvedValue({ data: { ok: true } });

    await sendErrorToTeams(error, context);

    expect(apiPostMock).toHaveBeenCalledWith(
      'https://dummy.webhook',
      expect.objectContaining({
        text: expect.stringContaining('Test error'),
      })
    );
    expect(loggerMock.error).not.toHaveBeenCalled();
  });

  it('logs error when apiService.post throws', async () => {
    process.env.TEAMS_WEBHOOK_URL = 'https://dummy.webhook';
    const postError = new Error('Bad Request');
    apiPostMock.mockRejectedValue(postError);

    await sendErrorToTeams(error, context);

    expect(loggerMock.error).toHaveBeenCalledWith(
      'Failed to send error notification to Teams:',
      postError
    );
  });
});
