CREATE TABLE "label" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "worklog_label" (
	"worklog_id" integer NOT NULL,
	"label_id" integer NOT NULL,
	CONSTRAINT "worklog_label_worklog_id_label_id_pk" PRIMARY KEY("worklog_id","label_id")
);
--> statement-breakpoint
CREATE TABLE "worklog" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"notes" text,
	"time" timestamp with time zone NOT NULL,
	"duration" interval
);
--> statement-breakpoint
ALTER TABLE "worklog_label" ADD CONSTRAINT "worklog_label_worklog_id_worklog_id_fk" FOREIGN KEY ("worklog_id") REFERENCES "public"."worklog"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worklog_label" ADD CONSTRAINT "worklog_label_label_id_label_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."label"("id") ON DELETE no action ON UPDATE no action;