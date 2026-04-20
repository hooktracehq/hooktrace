export function PageHeader({
    title,
    description,
    right,
  }: {
    title: string
    description?: string
    right?: React.ReactNode
  }) {
    return (
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </div>
        {right}
      </div>
    )
  }