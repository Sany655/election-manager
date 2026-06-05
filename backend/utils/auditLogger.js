const { AuditLog } = require('../models');

const logAudit = async ({
  entity_type,
  entity_id,
  action,
  old_value = null,
  new_value = null,
  changed_by = null,
  transaction = null
}) => {
  return AuditLog.create(
    {
      entity_type,
      entity_id,
      action,
      old_value,
      new_value,
      changed_by
    },
    transaction ? { transaction } : {}
  );
};

module.exports = logAudit;