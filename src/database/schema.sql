CREATE TABLE "messages" (
	"id" UUID NOT NULL,
	"conversation_data" JSON NOT NULL,
	"flow" JSON NOT NULL DEFAULT '{}',
	"user_data" JSON NOT NULL DEFAULT '{}',
	"last_interaction" TIMESTAMPTZ NOT NULL DEFAULT '2021-09-25 13:44:38.905245-03',
	"started_in" TIMESTAMPTZ NOT NULL DEFAULT '2021-09-25 13:44:38.923852-03',
	"transfered_in" TIMESTAMPTZ NULL DEFAULT NULL,
	"closed_in" TIMESTAMPTZ NULL DEFAULT NULL,
	"transfered_to" VARCHAR(50) NULL DEFAULT 'NULL::character varying',
	PRIMARY KEY ("id")
)
;
COMMENT ON COLUMN "messages"."id" IS '';
COMMENT ON COLUMN "messages"."conversation_data" IS '';
COMMENT ON COLUMN "messages"."flow" IS '';
COMMENT ON COLUMN "messages"."user_data" IS '';
COMMENT ON COLUMN "messages"."last_interaction" IS '';
COMMENT ON COLUMN "messages"."started_in" IS '';
COMMENT ON COLUMN "messages"."transfered_in" IS '';
COMMENT ON COLUMN "messages"."closed_in" IS '';
COMMENT ON COLUMN "messages"."transfered_to" IS '';
