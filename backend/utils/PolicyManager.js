const dayjs = require('dayjs');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter');
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

class PolicyManager {
  static buildUserPolicyMap(policyHistories, startDate, endDate) {
    const userPolicyMap = new Map();

    for (const policy of policyHistories) {
      const userId = policy.user_id;
      const policyStart = dayjs(policy.start_date);
      const policyEnd = policy.end_date ? dayjs(policy.end_date) : dayjs(endDate);

      const policyDetails = this.extractPolicyDetails(policy);

      let current = dayjs(startDate);
      while (current.isSameOrBefore(dayjs(endDate))) {
        if (current.isSameOrAfter(policyStart) && current.isSameOrBefore(policyEnd)) {
          const key = `${userId}_${current.format('YYYY-MM-DD')}`;
          userPolicyMap.set(key, policyDetails);
        }
        current = current.add(1, 'day');
      }
    }

    return userPolicyMap;
  }

  static extractPolicyDetails(policy) {
    return {
      working_days: policy['attendence_policy.working_days'],
      work_start_time: policy['attendence_policy.work_start_time'],
      work_end_time: policy['attendence_policy.work_end_time'],
      late_grace_period: parseInt(policy['attendence_policy.late_grace_period'] || 0),
      overtime_threshold: parseInt(policy['attendence_policy.overtime_threshold'] || 0),
      policy_id: policy.attendence_policy_id,
    };
  }
}

module.exports = PolicyManager;