type Duration = `${number}${'d' | 'w' | 'm' | 'h' | 'min'}`;

interface TimeframeResult {
  isActive: boolean;
  remainingDate?: string;
  remainingTime?: number;
  targetTime?: number;
  expiredTime?: string;
  progress?: number;
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

  const formatTime = (milliseconds: number): string => {
    const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000));
    milliseconds %= 24 * 60 * 60 * 1000;
    const hours = Math.floor(milliseconds / (60 * 60 * 1000));
    milliseconds %= 60 * 60 * 1000;
    const minutes = Math.floor(milliseconds / (60 * 1000));
    milliseconds %= 60 * 1000;
    const seconds = Math.floor(milliseconds / 1000);

    const parts = [];
    if (days > 0) parts.push(`${days} día${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hora${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minuto${minutes > 1 ? 's' : ''}`);
    // if (seconds > 0) parts.push(`${seconds} segundo${seconds > 1 ? 's' : ''}`);

    return parts.join(', ');
  };

  if (timeDifference > 0) {
    const progress = (timeDifference / durationInMilliseconds) * 100;
    return {
      isActive: true,
      remainingDate: formatTime(timeDifference),
      remainingTime: timeDifference,
      targetTime: targetDate.getTime(),
      progress: progress,
    };
  } else {
    return {
      isActive: false,
      expiredTime: formatTime(Math.abs(timeDifference)),
      progress: 0,
    };
  }
};

export default isWithinTimeframe;
