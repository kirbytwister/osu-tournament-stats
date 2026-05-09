import {
	type PgTimestampConfig,
	pgEnum,
	primaryKey,
	snakeCase,
	timestamp,
} from "drizzle-orm/pg-core";

export const QualifierSeedingMethod = pgEnum("qualifier_seeding_method", [
	"average_score",
	"sum_of_placements",
	"percent_max",
	"percent_diff",
	"z_sum",
	"z_percentile",
	"zipfs_law",
]);
export const Ruleset = pgEnum("ruleset", ["osu", "taiko", "fruits", "mania"]);

const timestampConfig: PgTimestampConfig = {
	mode: "date",
	withTimezone: true,
};

const timestampColumns = () => {
	return {
		createdAt: timestamp("created_at", timestampConfig).notNull().defaultNow(),
		updatedAt: timestamp("updated_at", timestampConfig).notNull().defaultNow(),
	};
};

export const Users = snakeCase.table("user", (t) => ({
	id: t.integer().generatedAlwaysAsIdentity().primaryKey(),
	username: t.text().notNull(),
	osuId: t.integer().notNull().unique(),
	...timestampColumns(),
}));
export type User = typeof Users.$inferSelect;

export const Sessions = snakeCase.table("session", (table) => ({
	id: table.text().primaryKey(),
	userId: table
		.integer()
		.notNull()
		.references(() => Users.id, { onDelete: "cascade" }),
	secretHash: table.text().notNull(),
	lastVerifiedAt: table.timestamp(timestampConfig).notNull().defaultNow(),
	createdAt: timestampColumns().createdAt,
}));
export type Session = typeof Sessions.$inferSelect;

export const Tournaments = snakeCase.table("tournament", (t) => ({
	id: t.integer().generatedAlwaysAsIdentity().primaryKey(),
	creatorUserId: t
		.integer()
		.notNull()
		.references(() => Users.id),
	name: t.varchar().notNull().unique(),
	abbreviation: t.varchar(),
	ruleset: Ruleset(),
	playersPerTeam: t.integer(),
	playingTeamSize: t.integer(),
	qualifierSeedingMethod: QualifierSeedingMethod(),
	...timestampColumns(),
}));

export const TournamentAccess = snakeCase.table(
	"tournament_access",
	(t) => ({
		tournamentId: t
			.integer()
			.notNull()
			.references(() => Tournaments.id),
		userId: t
			.integer()
			.notNull()
			.references(() => Users.id),
	}),
	(t) => [primaryKey({ columns: [t.tournamentId, t.userId] })],
);
