import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
	label: {
		worklogs: r.many.worklog({
			from: r.label.id.through(r.worklogLabel.labelId),
			to: r.worklog.id.through(r.worklogLabel.worklogId)
		}),
	},
	worklog: {
		labels: r.many.label(),
	},
}))