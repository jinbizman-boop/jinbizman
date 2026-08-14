-- P2-005 IDX-P2-005-003: support expense request recency lists.
CREATE INDEX ix_expense_requests_expense_date_id
  ON expense_requests (expense_date DESC, id DESC);
