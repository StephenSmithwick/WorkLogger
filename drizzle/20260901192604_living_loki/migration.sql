ALTER TABLE "worklog_label" DROP CONSTRAINT "worklog_label_worklog_id_worklog_id_fkey";--> statement-breakpoint
ALTER TABLE "worklog_label" ADD CONSTRAINT "worklog_label_worklog_id_worklog_id_fkey" FOREIGN KEY ("worklog_id") REFERENCES "worklog"("id") ON DELETE CASCADE;
