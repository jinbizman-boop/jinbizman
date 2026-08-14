-- P2-005 IDX-P2-005-001: support public news listing filter and pinned/published ordering.
CREATE INDEX ix_news_posts_status_pinned_published_at
  ON news_posts (status, is_pinned DESC, published_at DESC);
