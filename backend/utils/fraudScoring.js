const WEIGHTS = {
  largeTransaction: 25,
  highFrequency: 20,
  newDevice: 15,
  suspiciousTiming: 10,
  dailyLimit: 30,
};

const THRESHOLDS = {
  largeTransaction: 10000,
  highFrequencyCount: 5,
  highFrequencyWindowMinutes: 10,
  dailyLimit: 50000,
  suspiciousStartHour: 0,
  suspiciousEndHour: 5,
};

function getDecision(score) {
  if (score >= 40) return "require_otp";
  return "approve";
}

export function evaluateFraudRisk({
  amount,
  isNewDevice,
  recentTransferCount,
  dailyTotalAfter,
  currentHour,
}) {
  const flags = [];
  let score = 0;

  if (amount > THRESHOLDS.largeTransaction) {
    score += WEIGHTS.largeTransaction;
    flags.push("large_transaction");
  }

  if (recentTransferCount >= THRESHOLDS.highFrequencyCount) {
    score += WEIGHTS.highFrequency;
    flags.push("high_frequency");
  }

  if (isNewDevice) {
    score += WEIGHTS.newDevice;
    flags.push("new_device");
  }

  if (
    currentHour >= THRESHOLDS.suspiciousStartHour &&
    currentHour < THRESHOLDS.suspiciousEndHour
  ) {
    score += WEIGHTS.suspiciousTiming;
    flags.push("suspicious_time");
  }

  if (dailyTotalAfter > THRESHOLDS.dailyLimit) {
    score += WEIGHTS.dailyLimit;
    flags.push("daily_limit_exceeded");
  }

  return {
    riskScore: score,
    fraudFlags: flags,
    decision: getDecision(score),
  };
}

export { THRESHOLDS };
