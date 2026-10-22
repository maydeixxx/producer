CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    task_type varchar(255) NOT NULL,
    task_status varchar(255) NOT NULL,
    task_priority varchar(255) NOT NULL,
    title varchar(255) NOT NULL,
    normalized_title varchar(255) NOT NULL,
    description TEXT NOT NULL,
    deadline DATE NOT NULL,
    created_at TIMESTAMP NOT NULL,
    last_activity_at TIMESTAMP NOT NULL
);