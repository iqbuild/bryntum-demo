import type { IBryntumTaskDependency } from '@/interfaces/bryntumTask'

export const DEPENDENCIES_DATA: Record<string, IBryntumTaskDependency[]> = {
  ['8bd2eccc35a60feb96889ad83372d761']: [
    {
      from: '8bd2eccc35a60feb96889ad83372d6fc',
      to: '8bd2eccc35a60feb96889ad83372d761',
      type: '0',
      lag: 2,
    },
  ],
} as const satisfies Record<string, IBryntumTaskDependency[]>
