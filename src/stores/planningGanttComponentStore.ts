import { ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import type {
  GanttBase,
  ColumnStore,
  Model,
  DependencyStore,
  ResourceModel,
  AssignmentModel,
  CalendarModel,
} from '@bryntum/gantt'
import type { Ref } from 'vue'
import { usePlanningGanttDataStore } from './planningGanttDataStore'
import type { IBryntumTask, ITaskModel } from '@/interfaces/bryntumTask'
import { FIRST_LEVELS } from '@/constants/firstLevel'

export type GanttColumn =
  | 'name'
  | 'startDate'
  | 'endDate'
  | 'weight'
  | 'duration'
  | 'realProgress'
  | 'programmedProgress'
  | 'diffProgress'
  | 'incidence'

export interface IGanttColumn {
  index: number
  text: string
  field: GanttColumn
  checked: boolean
}

export interface PlanningGanttComponentStore {
  tasksData: Ref<ITaskModel[]>
  dependenciesData: Ref<DependencyStore[]>
  resourcesData: Ref<ResourceModel[]>
  assignmentsData: Ref<AssignmentModel[]>
  calendarsData: Ref<CalendarModel[]>

  ganttInstance: Ref<GanttBase | null>
  isEditMode: Ref<boolean>
  zoomLevel: Ref<number>
  isExpanded: Ref<boolean>
  useCriticalPath: Ref<boolean>
  useBaseLines: Ref<boolean>

  getInitialData: () => void
  setIsEditMode: () => void
  increaseZoom: () => void
  decreaseZoom: () => void
  getGanttColumns: () => IGanttColumn[]
  toggleCriticalPath: () => void
  toggleColumn: (columnName: GanttColumn[]) => void
  toggleBaselines: () => void
  toggleExpand: () => void
  setGanttInstance: (instance: GanttBase | null) => Ref<GanttBase | null>
  getGanttInstance: () => Ref<GanttBase | null>
  loadSubLevel: ({ taskRecord }: { taskRecord: Model }) => void
}

const DEFAULT_ZOOM = 4

export const usePlanningGanttComponentStore = defineStore<
  'planningGanttComponent',
  PlanningGanttComponentStore
>('planningGanttComponent', () => {
  const projectId = FIRST_LEVELS[0].id

  const planningGanttDataStore = usePlanningGanttDataStore()
  const { startingLevels } = storeToRefs(planningGanttDataStore)

  const ganttInstance = ref<GanttBase | null>(null)

  const isEditMode = ref(true)
  const isExpanded = ref(false)
  const zoomLevel = ref(DEFAULT_ZOOM)
  const useCriticalPath = ref(false)
  const useBaseLines = ref(false)

  const tasksData = ref<ITaskModel[]>([])
  const dependenciesData = ref<DependencyStore[]>([])
  const resourcesData = ref<ResourceModel[]>([])
  const assignmentsData = ref<AssignmentModel[]>([])
  const calendarsData = ref<CalendarModel[]>([])

  const setIsEditMode = () => {
    if (ganttInstance.value) {
      ganttInstance.value.readOnly = !ganttInstance.value.readOnly
      isEditMode.value = ganttInstance.value.readOnly
    }
  }

  const increaseZoom = () => {
    if (zoomLevel.value >= 24) return
    zoomLevel.value += 1
  }

  const decreaseZoom = () => {
    if (zoomLevel.value <= 0) return
    zoomLevel.value -= 1
  }

  const toggleCriticalPath = () => {
    useCriticalPath.value = !useCriticalPath.value
  }

  const getGanttColumns = (): IGanttColumn[] => {
    if (ganttInstance.value) {
      return (
        (ganttInstance.value.columns as ColumnStore[])
          ?.map(
            (column, index) =>
              ({
                index,
                // @ts-expect-error property exists on data
                text: column.data.text,
                // @ts-expect-error property exists on data
                field: column.data.field,
                // @ts-expect-error property exists on data
                checked: !column.data.hidden,
              }) as IGanttColumn,
          )
          .filter((column) => column.text) || []
      )
    }

    return []
  }

  const toggleColumn = (columnsSelected: GanttColumn[]) => {
    if (ganttInstance.value) {
      const columns = getGanttColumns()

      columns.forEach((column) => {
        // @ts-expect-error get exists in columns data
        const ganttColumn = ganttInstance.value?.columns.get(column.field)
        if (ganttColumn) {
          if (columnsSelected.includes(column.field)) {
            ganttColumn.hidden = false
          } else {
            ganttColumn.hidden = true
          }
        }
      })
    }
  }

  const toggleExpand = () => {
    if (ganttInstance.value) {
      if (isExpanded.value) {
        ganttInstance.value.collapseAll()
        ganttInstance.value.expand(projectId)
      } else {
        ganttInstance.value.expandAll()
      }
      isExpanded.value = !isExpanded.value
    }
  }

  const toggleBaselines = () => {
    if (ganttInstance.value) {
      ganttInstance.value.features.baselines.disabled =
        !ganttInstance.value.features.baselines.disabled
      useBaseLines.value = !ganttInstance.value.features.baselines.disabled

      if (useBaseLines.value) {
        ganttInstance.value.rowHeight = 50
      } else {
        ganttInstance.value.rowHeight = 40
      }
    }
  }

  const setGanttInstance = (instance: GanttBase | null) => {
    ganttInstance.value = instance
    return ganttInstance
  }

  const getGanttInstance = () => {
    return ganttInstance
  }

  const getInitialData = () => {
    // @ts-expect-error startingLevel has the same type
    if (startingLevels.value?.length) tasksData.value = startingLevels.value
  }

  const loadSubLevel = async ({ taskRecord }: { taskRecord: Model | undefined }): Promise<void> => {
    if (!taskRecord) return

    // @ts-expect-error originalData exists
    const id = taskRecord?.originalData.id
    // @ts-expect-error originalData exists
    const type = taskRecord?.originalData.type
    const instance = getGanttInstance()

    if (!instance.value) return

    const entityInstance = instance.value.taskStore.getById(id) as Model | undefined

    if (
      entityInstance &&
      Array.isArray(entityInstance?.children) &&
      entityInstance?.children?.length
    ) {
      return
    }

    let subLevels: IBryntumTask[] = []
    if (type === 'Phase') {
      const subProcess = await planningGanttDataStore.fetchSubProcessLevel({
        parentIds: [id],
      })
      subLevels = subProcess[id]
    }

    console.log({ entityInstance })

    entityInstance?.insertChild(subLevels)
    // instance.value.taskStore.add(subLevels)
  }

  return {
    tasksData,
    dependenciesData,
    resourcesData,
    assignmentsData,
    calendarsData,

    ganttInstance,
    isEditMode,
    zoomLevel,
    isExpanded,
    useCriticalPath,
    useBaseLines,

    getInitialData,
    setIsEditMode,
    increaseZoom,
    decreaseZoom,
    getGanttColumns,
    toggleCriticalPath,
    toggleColumn,
    toggleBaselines,
    toggleExpand,
    setGanttInstance,
    getGanttInstance,
    loadSubLevel,
  }
})
