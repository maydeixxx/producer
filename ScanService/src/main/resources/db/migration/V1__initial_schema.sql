CREATE TABLE experts(
    id UUID PRIMARY KEY,
    expert_link varchar(255) NOT NULL,
    expert_nickname varchar(255) NOT NULL UNIQUE,
    coverage BIGINT NOT NULL,
    target_aud TEXT NOT NULL,
    needs TEXT[] NOT NULL,
    levers TEXT[] NOT NULL
)