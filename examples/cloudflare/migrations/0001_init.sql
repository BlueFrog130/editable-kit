-- One row per page. Keyed so a second page costs a row, not a migration.
create table if not exists content (
	key text primary key,
	json text not null,
	updated_at integer not null default (unixepoch())
);
