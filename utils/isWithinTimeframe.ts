type Duration = `${number}${'d' | 'w' | 'm' | 'h' | 'min'}`;

interface TimeframeResult {
  isActive: boolean;
  remainingTime?: number;
  expiredTime?: number;
}

const isWithinTimeframe = (
  duration: Duration,
  fromDate: Date = new Date()
): TimeframeResult => {
  const durationMap: Record<string, number> = {
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
    m: 30 * 24 * 60 * 60 * 1000,
    h: 60 * 60 * 1000,
    min: 60 * 1000,
  };

  const match = duration.match(/^(\d+)(d|w|m|h|min)$/);
  if (!match) {
    throw new Error(
      'Invalid duration format. Use "1d", "1w", "1m", "1h", or "1min".'
    );
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const durationInMilliseconds = value * durationMap[unit];
  const targetDate = new Date(fromDate.getTime() + durationInMilliseconds);

  const now = new Date();
  const timeDifference = targetDate.getTime() - now.getTime();

  if (timeDifference > 0) {
    return {
      isActive: true,
      remainingTime: timeDifference,
    };
  } else {
    return {
      isActive: false,
      expiredTime: Math.abs(timeDifference),
    };
  }
};

export default isWithinTimeframe;
