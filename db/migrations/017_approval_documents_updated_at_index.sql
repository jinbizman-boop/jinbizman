-- P2-005 IDX-P2-005-002: support approval document recency lists.
CREATE INDEX ix_approval_documents_updated_at
  ON approval_documents (updated_at DESC);
