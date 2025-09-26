CREATE TABLE users
(
    id          BIGINT AUTO_INCREMENT NOT NULL,
    created_at  datetime              NULL,
    updated_at  datetime              NULL,
    created_by  VARCHAR(255)          NULL,
    updated_by  VARCHAR(255)          NULL,
    email       VARCHAR(255)          NOT NULL,
    password    VARCHAR(255)          NULL,
    provider    VARCHAR(255)          NOT NULL,
    avatar_url  VARCHAR(255)          NULL,
    provider_id VARCHAR(255)          NULL,
    fullname    VARCHAR(255)          NOT NULL,
    CONSTRAINT pk_users PRIMARY KEY (id)
);

ALTER TABLE users
    ADD CONSTRAINT uc_users_email UNIQUE (email);