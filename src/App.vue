<script setup lang="ts">
import { onMounted } from 'vue'
import PlanningGantt from './components/PlanningGantt.vue'
import { usePlanningGanttDataStore } from './stores/planningGanttDataStore'
import { usePlanningGanttComponentStore } from './stores/planningGanttComponentStore'
import { ref, computed } from 'vue'
import ButtonGroup from 'primevue/buttongroup'
import Button from 'primevue/button'
import MultiSelect from 'primevue/multiselect'

const planningGanttDataStore = usePlanningGanttDataStore()
const planningGanttComponentStore = usePlanningGanttComponentStore()

const isLoadingData = ref<boolean>(true)
const isMounted = ref<boolean>(false)
const selectedColumns = computed(() => {
  const columns = planningGanttComponentStore.getGanttColumns()
  return columns.filter((column) => column.checked).map((column) => column.field)
})
const columns = computed(() => planningGanttComponentStore.getGanttColumns())

const reloadGantt = async () => {
  isLoadingData.value = true
  await planningGanttDataStore.fetchFirstLevels()
  isLoadingData.value = false
}

onMounted(async () => {
  if (!isMounted.value) {
    await reloadGantt()
    isMounted.value = true
  }
})
</script>

<template>
  <div>
    <template v-if="isLoadingData">
      <div class="d-flex justify-content-center">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </template>
    <div v-else class="container">
      <section class="header">
        <section>
          <h1>Gantt</h1>
        </section>
        <section class="header-buttons">
          <ButtonGroup>
            <Button
              @click="planningGanttComponentStore.decreaseZoom"
              label="Decrease Zoom"
              size="small"
            />
            <Button
              @click="planningGanttComponentStore.increaseZoom"
              label="Increase Zoom"
              size="small"
            />
          </ButtonGroup>
          <Button
            @click="planningGanttComponentStore.toggleExpand"
            label="Toogle Expand"
            size="small"
          />
          <Button
            @click="planningGanttComponentStore.toggleBaselines"
            label="Toogle Baselines"
            size="small"
          />
          <Button
            @click="planningGanttComponentStore.toggleCriticalPath"
            label=" Toogle Critical Path"
            size="small"
          />

          <MultiSelect
            :defaultValue="selectedColumns"
            @change="(event) => planningGanttComponentStore.toggleColumn(event.value)"
            :options="columns"
            optionValue="field"
            optionLabel="text"
            filter
            placeholder="Select Columns"
            class="w-full md:w-80"
          />
        </section>
      </section>
      <PlanningGantt ref="planningGantt" />
    </div>
  </div>
</template>

<style lang="scss">
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: grey;
}

.header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

h1 {
  font-size: 1.5rem;
  color: white;
}

.header-buttons {
  display: flex;
  flex-direction: row;
  gap: 16px;
  padding: 16px 10px;
}

.container-fluid {
  --vz-gutter-x: 0rem !important;
  --vz-gutter-y: 0rem !important;
  width: 100%;
  padding-right: calc(var(--vz-gutter-y) * 0.5) !important;
  padding-left: calc(var(--vz-gutter-x) * 0.5) !important;
}

.timerProgressBarsuccessAlert {
  background-color: #22b918 !important;
}
.timerProgressBarwarningAlert {
  background-color: orange !important;
}
.timerProgressBarerrorAlert {
  background-color: #d33 !important;
}
</style>
