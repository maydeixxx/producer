CREATE TABLE outbox_events(
    id UUID PRIMARY KEY,
    task_id UUID NOT NULL,
    payload TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    status varchar(255) NOT NULL,
    retries INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_status_createdAt on outbox_events(status, created_at);