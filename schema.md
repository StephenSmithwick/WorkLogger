The neon schema.

## WorkLog

Work done at a specific time on a specific day

```sql
CREATE TABLE worklog (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name worklog_id_seq),
  name text NOT NULL,
  notes text,
  time timestamp with time zone NOT NULL,
  duration interval
);
```

## Label
All work logged can have zero to many labels applied
```sql
CREATE TABLE label (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name label_id_seq),
  name text
);
```

CREATE TABLE worklog_label (
    worklog_id INT NOT NULL,
    label_id INT NOT NULL,
    
    PRIMARY KEY (worklog_id, label_id),
    
    FOREIGN KEY (worklog_id) REFERENCES public.worklog(id),
    FOREIGN KEY (label_id) REFERENCES public.label(id)
);
