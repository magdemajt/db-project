create table if not exists groups
(
  id serial primary key,
  name text not null,
  created_at timestamp not null default now()
);

create table if not exists groups_participants
(
  id serial primary key,
  id_groups int not null references groups(id) on delete cascade,
  id_users int not null references users(id) on delete cascade
);

create unique index if not exists groups_name on groups(name);
create index if not exists groups_participants_id_groups on groups_participants using hash(id_groups);
create index if not exists groups_participants_id_users on groups_participants using hash(id_users);
