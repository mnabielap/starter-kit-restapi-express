import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Users Table
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.string('role').notNullable().defaultTo('user'); // Enforced via application logic
    table.integer('is_email_verified').notNullable().defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Tokens Table
  await knex.schema.createTable('tokens', (table) => {
    table.increments('id').primary();
    table.string('token').notNullable();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('type').notNullable();
    table.timestamp('expires').notNullable();
    table.integer('blacklisted').notNullable().defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['user_id', 'type']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('tokens');
  await knex.schema.dropTableIfExists('users');
}