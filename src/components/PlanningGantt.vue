<script setup lang="ts">
import numeral from 'numeral'
import type { TaskModel, GanttBase, Model } from '@bryntum/gantt'
import { StringHelper, LocaleManager } from '@bryntum/gantt'
// @ts-expect-error locales exists
import EsLocale from '@bryntum/gantt/locales/gantt.locale.Es.js'
import { BryntumGantt } from '@bryntum/gantt-vue-3'
import { round } from 'lodash'
import { type BryntumGanttProps } from '@bryntum/gantt-vue-3'
import moment from 'moment-timezone'

import { usePlanningGanttComponentStore } from '@/stores/planningGanttComponentStore'
import { onBeforeUnmount, ref, watch, defineEmits } from 'vue'
import { reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { FIRST_LEVELS } from '@/constants/firstLevel'

const emit = defineEmits([
  'onSelectionChange',
  'onChangeTask',
  'onDeleteTask',
  'onProjectEntityChange',
  'onEntityCreation',
  'onSortTask',
  'onDependencyChange',
  'onDependencyLevel5Change',
  'onDependencyUpdate',
  'onDependencyRemove',
  'onShowSubLevel',
])

const planningGanttStore = usePlanningGanttComponentStore()
const { isEditMode, setGanttInstance, getGanttInstance, getInitialData, loadSubLevel } =
  planningGanttStore
const {
  tasksData,
  dependenciesData,
  resourcesData,
  assignmentsData,
  calendarsData,
  zoomLevel,
  useBaseLines,
  useCriticalPath,
} = storeToRefs(planningGanttStore)

const isMounted = ref(false)

const lastControlDate = ref<string>(moment().format('DD-MM-YYYY'))

const getTextCellStyle = (value: string, level: number) => {
  if (level === 0) {
    return `<b>${value}</b>`
  }

  if (level >= 1 && level <= 5) {
    const fontWeight = 600 - level * 100
    return `<div style="font-weight: ${fontWeight} !important">${value}</div>`
  }

  return `${value}`
}

const getDateCellStyle = (value: string, level: number) => {
  const timezone = 'America/Santiago'
  const date = moment.tz(value, timezone).format('DD/MM/YYYY')

  if (level === 0) {
    return `<b>${date}</b>`
  }

  if (level >= 1 && level <= 5) {
    const fontWeight = 600 - level * 100
    return `<div style="font-weight: ${fontWeight} !important">${date}</div>`
  }

  return `${value}`
}

const planningGantt = ref<{ instance: { value: GanttBase } } | null>(null)
const ganttConfig = reactive<BryntumGanttProps>({
  rowHeight: 45,
  tickSize: 45,
  barMargin: 8,
  weekStartDay: 1,
  readOnly: !isEditMode,
  minDate: moment(FIRST_LEVELS[0].startDate).subtract(2, 'w').toDate(),
  maxDate: moment(FIRST_LEVELS[0].endDate).add(12, 'w').toDate(),
  listeners: {
    beforeTaskAdd: (task) => {
      console.log(task)
    },
  },
  timeRangesFeature: {
    disabled: false,
  },
  baselinesFeature: {
    disabled: !useBaseLines,
  },
  criticalPathsFeature: {
    disabled: false,
  },
  dependenciesFeature: {
    disabled: false,
  },
  project: {
    autoSetConstraints: true, // automatically introduce `startnoearlier` constraint if tasks do not use constraints, dependencies, or manuallyScheduled
    calendars: calendarsData,
    assignments: assignmentsData,
    resources: resourcesData,
    dependencies: dependenciesData,
  },
  timeRanges: [
    {
      id: 1,
      name: moment(lastControlDate.value).format('DD-MM-YYYY'),
      startDate: lastControlDate.value,
      cls: 'lastControlDate',
    },
  ],
  taskMenuFeature: {
    items: {
      addTask: {
        text: 'Agregar nuevo',
        icon: 'b-icon-add',
        weight: 100,
        onItem(taskRecord) {
          emit('onChangeTask', { eventType: 'addTask', taskRecord })
        },
      },
      addNextlevel: {
        text: 'Mostrar subnivel',
        icon: 'b-fa-angle-double-right',
        weight: 100,
        onItem: (taskRecord) => loadSubLevel({ taskRecord: taskRecord.record }),
      },
      moveTask: {
        text: 'Mover a',
        icon: 'b-fa-angle-right',
        weight: 200,
        onItem(taskRecord) {
          emit('onChangeTask', { eventType: 'moveTask', taskRecord })
        },
      },
      deleteTask: {
        text: 'Eliminar tarea',
        weight: 300,
        onItem(taskRecord) {
          emit('onDeleteTask', taskRecord)
        },
      },
      editTask: false,
      cut: false,
      copy: false,
      paste: false,
      add: false,
      indent: false,
      outdent: false,
      convertToMilestone: false,
      linkTasks: false,
      unlinkTasks: false,
      taskColor: false,
      splitTask: false,
    },
  },
  columns: [
    {
      type: 'name',
      field: 'name',
      text: 'Name',
      width: 300,
      htmlEncode: false,
      renderer: (item) => {
        // @ts-expect-error originalData exists
        return getTextCellStyle(item.value, item.record.originalData.level)
      },
    },
    {
      type: 'date',
      field: 'startDate',
      text: 'Start Date',
      htmlEncode: false,
      renderer: (item) => {
        // @ts-expect-error originalData exists
        return getDateCellStyle(item.value, item.record.originalData.level)
      },
    },
    {
      type: 'date',
      field: 'endDate',
      text: 'End Date',
      htmlEncode: false,
      renderer: (item) => {
        // @ts-expect-error originalData exists
        return getDateCellStyle(item.value, item.record.originalData.level)
      },
    },

    {
      type: 'number',
      field: 'weight',
      width: 100,
      text: 'Weight',
      hidden: true,
      renderer: (item) => {
        let weightValue = '0'
        if (Number.isFinite(item.value)) {
          weightValue = numeral(item.value).format('0,0.[0]')
        }
        return weightValue
      },
    },
    {
      type: 'duration',
      field: 'duration',
      width: 70,
      hidden: true,
      editor: false,
    },
    {
      field: 'prog',
      width: 70,
      text: 'Prog.',
      editor: false,
      htmlEncode: false,
      renderer: (item: { record: Model; value: string }) => {
        // @ts-expect-error originalData exists
        return getTextCellStyle(item.value, item.record.originalData.level)
      },
    },
    {
      field: 'real',
      width: 70,
      text: 'Real',
      editor: false,
      htmlEncode: false,
      renderer: (item: { record: Model; value: string }) => {
        // @ts-expect-error originalData exists
        return getTextCellStyle(item.value, item.record.originalData.level)
      },
    },
    {
      field: 'diff',
      width: 70,
      text: 'Diff',
      editor: false,
      htmlEncode: false,
      renderer: (item) => {
        const value = item.value ? item.value.replace('%', '') : 0
        if (item.record.originalData.level === 1 || item.record.originalData.level === 0) {
          return value >= 0
            ? `<div style="color: #25c726 !important;"><b>${item.value}</b></div>`
            : `<div style="color: #de0000 !important;"><b>${item.value}</b></div>`
        }
        return value >= 0
          ? `<div style="color: #25c726 !important;">${item.value}</div>`
          : `<div style="color: #de0000 !important;">${item.value}</div>`
      },
    },
    {
      field: 'incidence',
      width: 100,
      text: 'Incidencia',
      hidden: true,
      htmlEncode: false,
      renderer: (item) => {
        const instance = getGanttInstance()
        const summaryInstance = instance.value?.taskStore.getById(FIRST_LEVELS[0].id)

        const incidenceString = item.value.replace('%', '')
        let incidenceValue = Number(incidenceString)

        const rowType = item.record.originalData.type
        // @ts-expect-error originalData exists
        const projectWeight = summaryInstance?.originalData?.weight || 0

        if (rowType !== 'Project') {
          incidenceValue = projectWeight ? incidenceValue / projectWeight : 0
        }

        const value = round(incidenceValue, 2)

        return `<div style="color: ${value >= 0 ? '#25c726' : '#de0000'} !important;">${value}%</div>`
      },
    },
  ],

  // Custom task content, display task name on child tasks
  taskRenderer({ taskRecord }: { taskRecord: TaskModel }) {
    if (taskRecord.isLeaf && !taskRecord.isMilestone) {
      return StringHelper.encodeHtml(taskRecord.name)
    }
    return ''
  },
})

watch([zoomLevel, useCriticalPath], (newValue, oldValue) => {
  if (isMounted.value) {
    const [newZoomLevel, newCriticalPath] = newValue
    const [oldZoomLevel, oldCriticalPath] = oldValue

    const ganttInstance = getGanttInstance()
    if (ganttInstance.value) {
      if (newZoomLevel !== oldZoomLevel) {
        ganttInstance.value.zoomLevel = newZoomLevel
      }

      if (newCriticalPath !== oldCriticalPath) {
        ganttInstance.value.features.criticalPaths.disabled = !useCriticalPath.value
      }
    }
  }
})

watch(
  [planningGantt],
  () => {
    if (!isMounted.value) {
      getInitialData()

      const ganttInstance = setGanttInstance(planningGantt.value?.instance?.value || null)
      if (ganttInstance.value) {
        ganttInstance.value.expand(FIRST_LEVELS[0].id)
        ganttInstance.value.zoomLevel = zoomLevel.value

        // ganttInstance.value.timeZone =
        // projectSelected.value?.timezone || 'America/Santiago';
        LocaleManager.applyLocale(EsLocale)

        isMounted.value = true
      }
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  const ganttInstance = getGanttInstance()
  if (ganttInstance.value) {
    ganttInstance.value.destroy()
  }
})
</script>

<template>
  <div style="display: flex; flex-direction: column; height: calc(87vh)">
    <bryntum-gantt ref="planningGantt" v-bind="ganttConfig" :data="tasksData" />
  </div>
</template>

<style lang="scss">
@import '@bryntum/gantt/gantt.stockholm.css';
.b-grid-cell {
  color: #000000 !important;
}

.b-grid-cell.b-checkbox-selection {
  background-color: white !important;
}

.event-label {
  font-size: 10px !important;
  margin-top: 0em !important;
  margin: inherit;
  color: black !important;
  min-width: unset !important;
  z-index: 9999 !important;
}

.b-baseline-wrap {
  top: 0.9em !important;
}

.b-sch-terminals-visible {
  color: black !important;
}

.b-gridbase.b-container {
  font-family: 'Montserrat', sans-serif !important;
  font-size: 12px !important;
  .b-sch-header-text,
  .b-grid-header-text,
  .b-widget {
    font-weight: bold !important;
  }
}

.b-grid-header-container {
  // Header cell
  box-shadow: unset !important;
  border-bottom: unset !important;
  .b-grid-header {
    background-color: #f8f8f8 !important;
    border-right: 0px !important;
  }
  // All upper dates row children
  .b-sch-header-row-0 * {
    border-right-color: #f8f8f8 !important;
  }
  // All lower dates row children
  // .b-sch-header-row-1 * {
  //   background-color: #ffffff !important;
  // }
  .b-sch-header-timeaxis-cell {
    border-right-color: #f7f9f9 !important;
    border-bottom-color: #f7f9f9 !important;
  }
}

.b-sch-line.lastControlDate {
  background-color: red !important;
  border-color: red !important;
}
</style>
