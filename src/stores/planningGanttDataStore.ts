/** Package libraries */
import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'

/** Models */
import type {
  IBryntumTask,
  IBryntumTaskDependency,
  IBryntumTaskSummary,
} from '@/interfaces/bryntumTask'
import { FIRST_LEVELS } from '@/constants/firstLevel'
import { SUBPROCESSES_LEVELS } from '@/constants/subProcessesLevel'
import { DEPENDENCIES_DATA } from '@/constants/dependencies'

/** Global utils */

export const usePlanningGanttDataStore = defineStore('planningGanttDataStore', () => {
  const startingLevels: Ref<IBryntumTaskSummary[]> = ref([])
  const subProcessLevels: Ref<Record<string, IBryntumTask[]>> = ref({})
  const dependencies: Ref<Record<string, IBryntumTaskDependency[]>> = ref({})

  const fetchFirstLevels = async (): Promise<IBryntumTaskSummary[]> => {
    startingLevels.value = FIRST_LEVELS
    return FIRST_LEVELS
  }

  const fetchSubProcessLevel = async (body: {
    parentIds: string[]
  }): Promise<Record<string, IBryntumTask[]>> => {
    const { parentIds } = body

    parentIds.forEach((parentId) => {
      const data = SUBPROCESSES_LEVELS[parentId]
      if (data) {
        subProcessLevels.value[parentId] = data
      }
    })

    return subProcessLevels.value
  }

  const fetchDependencies = async (): Promise<Record<string, IBryntumTaskDependency[]>> => {
    dependencies.value = DEPENDENCIES_DATA
    return DEPENDENCIES_DATA
  }

  return {
    /** state */
    startingLevels,
    subProcessLevels,
    dependencies,

    fetchFirstLevels,
    fetchSubProcessLevel,
    fetchDependencies,
  }
})
