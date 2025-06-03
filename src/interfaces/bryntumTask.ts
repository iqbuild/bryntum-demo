import type { TaskModel } from '@bryntum/gantt'

export interface IBryntumTaskProgressCurveValues {
  prog: string
  real: string
  diff: string
  incidence: string
  percentDone: string
}

export interface IBryntumTaskProgramCurveValues {
  startDate: Date
  endDate: Date
}

export interface IBryntumTaskCurveValues
  extends IBryntumTaskProgramCurveValues,
    IBryntumTaskProgressCurveValues {
  weight: number
}

export interface IBryntumTaskBaseline extends IBryntumTaskCurveValues {
  name: 'Obra' | 'Mandante'
}

export type EntityType =
  | 'Project'
  | 'PhaseGrouper'
  | 'Phase'
  | 'SubProcess'
  | 'Sector'
  | 'SubSector'

export interface IBryntumTask extends IBryntumTaskCurveValues {
  _internalId: string
  id: string
  name: string
  order: number
  level: number
  timezone: string
  baselines: IBryntumTaskBaseline[]
  expanded: boolean
  eventColor?: string
  draggable: boolean
  ExternalTask: boolean
  isSelectable: boolean
  manuallyScheduled: boolean
  calendar: string
  type: EntityType
  cls: 'successPhaseGrouper'
  parentId: string
  children: IBryntumTask[]
}

export interface IBryntumTaskSummary extends IBryntumTaskCurveValues {
  id: string
  name: string
  level: number
  baselines: IBryntumTaskBaseline[]
  manuallyScheduled: boolean
  calendar: string
  expanded: boolean
  draggable: boolean
  type: EntityType
  children: IBryntumTask[]
}

export type BryntumTaskDependencyType = '0' | '1' | '2' | '3'

export interface IBryntumTaskDependency {
  from: string
  to: string
  type: BryntumTaskDependencyType
  lag: number
}

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}

export type DeepPartialExcept<T, K extends keyof T> = DeepPartial<T> & Pick<T, K>

export interface ITaskModel
  extends DeepPartialExcept<
    Omit<TaskModel, 'children'>,
    'id' | 'name' | 'percentDone' | 'startDate' | 'endDate' | 'duration'
  > {
  type: EntityType
  weight: number
  prog: string
  real: string
  diff: string
  incidence: string
  children: ITaskModel[]
}
