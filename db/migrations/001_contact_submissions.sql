-- contact_submissions (spec #347 FR-4, work #440)
-- Stores contact-form submissions from POST /api/contact.
-- Reversible: down migration at bottom.

-- +migrate Up

CREATE TABLE contact_submissions (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    message     TEXT         NOT NULL,
    received_at TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT contact_submissions_name_not_blank    CHECK (length(btrim(name)) > 0),
    CONSTRAINT contact_submissions_email_not_blank   CHECK (length(btrim(email)) > 0),
    CONSTRAINT contact_submissions_message_not_blank CHECK (length(btrim(message)) > 0)
);

-- Append-only log, read chronologically (inbox view). Plain btree on
-- received_at serves ORDER BY received_at and range filters; id is already
-- the PK, so id-based pagination needs no extra index. Single-column on
-- email deliberately: no query path filters by name/email yet (YAGNI).
CREATE INDEX contact_submissions_received_at_idx ON contact_submissions (received_at);

-- +migrate Down

DROP TABLE contact_submissions;
