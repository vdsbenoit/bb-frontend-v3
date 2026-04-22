<script setup lang="ts">
import type { AttendantTimeSlot } from '@/types'
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonDatetime,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonPopover,
  IonSpinner,
  IonText,
} from '@ionic/vue'
import { updateDoc } from 'firebase/firestore'
import { addOutline, removeOutline, trashOutline } from 'ionicons/icons'
import { computed, reactive, ref, watch } from 'vue'
import HeaderComponent from '@/components/HeaderComponent.vue'
import RefresherComponent from '@/components/RefresherComponent.vue'
import { useAppConfig } from '@/composables/app'
import { APP_CONFIG_DOC_REF } from '@/constants'
import { generateRandomId } from '@/services/firebase'
import { errorPopup, loadingPopup, toastPopup } from '@/utils/popup'

interface TimeSlot {
  start: string
  stop: string
}

type TimeFieldKey = 'start' | 'stop'
interface TimeFieldTarget {
  section: 'player' | 'attendant'
  index: number
  key: TimeFieldKey
}

const HOUR_FORMAT_REGEX = /^(\d{1,2})h(\d{2})$/
const ISO_TIME_REGEX = /T(\d{2}):(\d{2})/

const defaultAttendantSchedule: AttendantTimeSlot[] = [
  { id: '', name: 'Matin', start: '08h30', stop: '12h00' },
  { id: '', name: 'Après-midi', start: '13h00', stop: '17h00' },
]

const formData = reactive({
  nbTimeSlots: 17,
  playerSchedule: [] as TimeSlot[],
  attendantSchedule: [] as AttendantTimeSlot[],
})
const isInitialized = ref(false)
const isSaving = ref(false)
const timePicker = reactive({
  isOpen: false,
  value: '2026-01-01T08:30:00',
  event: undefined as Event | undefined,
})
const timeFieldTarget = ref<TimeFieldTarget | null>(null)

const { data: appConfig, pending: isLoadingConfig, error: errorLoadingConfig } = useAppConfig()

watch(appConfig, (newConfig) => {
  if (!newConfig || isInitialized.value) return

  const configPlayerSchedule = newConfig.playerSchedule?.map(slot => ({ ...slot })) ?? []
  const configAttendantSchedule = newConfig.attendantSchedule?.map(slot => ({ ...slot })) ?? []

  formData.nbTimeSlots = ensureOdd(Math.max(1, configPlayerSchedule.length || 17))
  formData.playerSchedule = normalizePlayerSchedule(configPlayerSchedule, formData.nbTimeSlots)

  if (configAttendantSchedule.length > 0) {
    formData.attendantSchedule = configAttendantSchedule.map(slot => ({
      ...slot,
      id: slot.id || generateRandomId(),
    }))
  } else {
    formData.attendantSchedule = defaultAttendantSchedule.map(slot => ({
      ...slot,
      id: generateRandomId(),
    }))
  }

  isInitialized.value = true
})

const canDecreaseNbTimeSlots = computed(() => formData.nbTimeSlots > 1)

const hasInvalidPlayerSchedule = computed(() => {
  return formData.playerSchedule.some(slot => !slot.start.trim() || !slot.stop.trim())
})

const hasInvalidAttendantSchedule = computed(() => {
  return formData.attendantSchedule.some(slot => !slot.name.trim() || !slot.start.trim() || !slot.stop.trim())
})

const canSave = computed(() => {
  if (isSaving.value) return false
  if (formData.nbTimeSlots < 1 || formData.nbTimeSlots % 2 === 0) return false
  if (hasInvalidPlayerSchedule.value) return false
  if (hasInvalidAttendantSchedule.value) return false
  return true
})

function ensureOdd(value: number) {
  return value % 2 === 0 ? value + 1 : value
}

function defaultPlayerTimeSlot(index: number): TimeSlot {
  const totalMinutesStart = 8 * 60 + 30 + index * 30
  const totalMinutesStop = totalMinutesStart + 30

  const format = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${String(hours).padStart(2, '0')}h${String(minutes).padStart(2, '0')}`
  }

  return {
    start: format(totalMinutesStart),
    stop: format(totalMinutesStop),
  }
}

function toIsoDateTime(value: string) {
  const match = value.match(HOUR_FORMAT_REGEX)
  if (!match) return '2026-01-01T08:30:00'
  const hours = String(Math.min(23, Math.max(0, Number(match[1])))).padStart(2, '0')
  const minutes = String(Math.min(59, Math.max(0, Number(match[2])))).padStart(2, '0')
  return `2026-01-01T${hours}:${minutes}:00`
}

function toDisplayTime(isoValue: string) {
  const match = isoValue.match(ISO_TIME_REGEX)
  if (!match) return '08h30'
  return `${match[1]}h${match[2]}`
}

function openTimePicker(
  section: 'player' | 'attendant',
  index: number,
  key: TimeFieldKey,
  currentValue: string,
  triggerEvent?: Event,
) {
  timeFieldTarget.value = { section, index, key }
  timePicker.value = toIsoDateTime(currentValue)
  timePicker.event = triggerEvent
  timePicker.isOpen = true
}

function closeTimePicker() {
  timePicker.isOpen = false
  timePicker.event = undefined
  timeFieldTarget.value = null
}

function onTimeChange(event: CustomEvent<{ value?: string | string[] | null }>) {
  const selectedValue = event.detail.value
  if (!selectedValue || Array.isArray(selectedValue) || !timeFieldTarget.value) return

  const displayValue = toDisplayTime(selectedValue)
  const target = timeFieldTarget.value

  if (target.section === 'player') {
    formData.playerSchedule[target.index][target.key] = displayValue
  } else {
    formData.attendantSchedule[target.index][target.key] = displayValue
  }

  timePicker.value = selectedValue
  closeTimePicker()
}

function normalizePlayerSchedule(currentSchedule: TimeSlot[], targetLength: number) {
  const normalized = currentSchedule.slice(0, targetLength)
  while (normalized.length < targetLength) {
    normalized.push(defaultPlayerTimeSlot(normalized.length))
  }
  return normalized
}

function updateNbTimeSlots(step: number) {
  const nextValue = Math.max(1, formData.nbTimeSlots + step)
  formData.nbTimeSlots = ensureOdd(nextValue)
  formData.playerSchedule = normalizePlayerSchedule(formData.playerSchedule, formData.nbTimeSlots)
}

function addAttendantTimeSlot() {
  formData.attendantSchedule.push({
    id: generateRandomId(),
    name: `Plage ${formData.attendantSchedule.length + 1}`,
    start: '08h30',
    stop: '12h00',
  })
}

function removeAttendantTimeSlot(index: number) {
  formData.attendantSchedule.splice(index, 1)
}

async function saveConfiguration() {
  if (!canSave.value) return

  isSaving.value = true
  const loading = await loadingPopup('Enregistrement de la configuration...')

  try {
    await updateDoc(APP_CONFIG_DOC_REF, {
      playerSchedule: formData.playerSchedule.map(slot => ({
        start: slot.start.trim(),
        stop: slot.stop.trim(),
      })),
      attendantSchedule: formData.attendantSchedule.map(slot => ({
        id: slot.id || generateRandomId(),
        name: slot.name.trim(),
        start: slot.start.trim(),
        stop: slot.stop.trim(),
      })),
    })
    await loading.dismiss()
    await toastPopup('Configuration enregistrée')
  } catch (error: any) {
    await loading.dismiss()
    void errorPopup(error?.message ?? 'Impossible d\'enregistrer la configuration')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <IonPage>
    <HeaderComponent page-title="Configuration" />
    <IonContent :fullscreen="true">
      <RefresherComponent />

      <IonCard v-if="isLoadingConfig">
        <IonCardContent class="ion-text-center">
          <IonSpinner />
        </IonCardContent>
      </IonCard>

      <IonCard v-else-if="errorLoadingConfig">
        <IonCardHeader>
          <IonCardTitle color="danger">
            Erreur
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          Impossible de charger la configuration actuelle.
        </IonCardContent>
      </IonCard>

      <template v-else>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Horaire des joueurs</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonNote color="medium" class="ion-margin-bottom note-block">
              Ce réglage définit le nombre de créneaux par circuit.  Il doit rester impair.
            </IonNote>

            <IonItem>
              <IonLabel>Nombre de créneaux</IonLabel>
              <div slot="end" class="stepper">
                <IonButton
                  fill="outline"
                  size="small"
                  color="medium"
                  shape="round"
                  :disabled="!canDecreaseNbTimeSlots"
                  @click="updateNbTimeSlots(-2)"
                >
                  <IonIcon slot="icon-only" :icon="removeOutline" />
                </IonButton>
                <div class="stepper-value">
                  {{ formData.nbTimeSlots }}
                </div>
                <IonButton
                  fill="outline"
                  size="small"
                  color="medium"
                  shape="round"
                  @click="updateNbTimeSlots(2)"
                >
                  <IonIcon slot="icon-only" :icon="addOutline" />
                </IonButton>
              </div>
            </IonItem>

            <IonList class="ion-margin-top">
              <IonItem v-for="(slot, index) in formData.playerSchedule" :key="index">
                <IonLabel class="slot-label">Créneau {{ index + 1 }}</IonLabel>
                <div slot="end" class="slot-inputs">
                  <IonButton
                    fill="outline"
                    size="small"
                    class="time-chip"
                    @click="openTimePicker('player', index, 'start', slot.start, $event)"
                  >
                    {{ slot.start }}
                  </IonButton>
                  <span class="slot-separator">-</span>
                  <IonButton
                    fill="outline"
                    size="small"
                    class="time-chip"
                    @click="openTimePicker('player', index, 'stop', slot.stop, $event)"
                  >
                    {{ slot.stop }}
                  </IonButton>
                </div>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Horaire des animateurs</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem v-for="(slot, index) in formData.attendantSchedule" :key="slot.id">
                <IonLabel class="slot-label">Plage {{ index + 1 }}</IonLabel>
                <div class="attendant-row">
                  <IonInput
                    v-model="slot.name"
                    placeholder="Nom"
                    aria-label="Nom plage animateur"
                  />
                  <IonButton
                    fill="outline"
                    size="small"
                    class="time-chip"
                    @click="openTimePicker('attendant', index, 'start', slot.start, $event)"
                  >
                    {{ slot.start }}
                  </IonButton>
                  <IonButton
                    fill="outline"
                    size="small"
                    class="time-chip"
                    @click="openTimePicker('attendant', index, 'stop', slot.stop, $event)"
                  >
                    {{ slot.stop }}
                  </IonButton>
                  <IonButton
                    fill="clear"
                    color="danger"
                    :disabled="formData.attendantSchedule.length <= 1"
                    @click="removeAttendantTimeSlot(index)"
                  >
                    <IonIcon slot="icon-only" :icon="trashOutline" />
                  </IonButton>
                </div>
              </IonItem>
            </IonList>

            <IonButton expand="block" class="ion-margin-top" fill="clear" @click="addAttendantTimeSlot">
              <IonIcon slot="start" :icon="addOutline" />
              Ajouter une plage
            </IonButton>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Étapes suivantes</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText color="medium">
              <p>Prochaines sections prévues sur cette page :</p>
              <ul>
                <li>Création des catégories et groupes joueurs</li>
                <li>Configuration des noms d'épreuves</li>
                <li>Génération des documents (badges et roadmaps)</li>
              </ul>
            </IonText>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardContent>
            <IonButton
              expand="block"
              color="primary"
              :disabled="!canSave"
              @click="saveConfiguration"
            >
              Enregistrer la configuration
            </IonButton>
            <IonText v-if="!canSave" color="medium" class="ion-text-center">
              <p>Tous les champs doivent être remplis et le nombre de créneaux doit être impair.</p>
            </IonText>
          </IonCardContent>
        </IonCard>

        <IonPopover
          :is-open="timePicker.isOpen"
          :event="timePicker.event"
          reference="event"
          :keep-contents-mounted="true"
          @did-dismiss="closeTimePicker"
        >
          <IonDatetime
            presentation="time"
            locale="fr-BE-u-hc-h23"
            hour-cycle="h23"
            :value="timePicker.value"
            :show-default-buttons="true"
            done-text="Valider"
            cancel-text="Annuler"
            @ion-change="onTimeChange"
            @ion-cancel="closeTimePicker"
          />
        </IonPopover>
      </template>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.note-block {
  display: block;
}

.stepper {
  display: inline-flex;
  gap: 8px;
}

.stepper-value {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2ch;
  padding: 0 4px;
}

.slot-label {
  min-width: 85px;
}

.slot-inputs {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.slot-separator {
  color: var(--ion-color-medium);
}

.attendant-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.slot-inputs ion-input,
.attendant-row ion-input {
  width: 90px;
  --padding-start: 8px;
  --padding-end: 8px;
  border: 1px solid var(--ion-color-light-shade);
  border-radius: 8px;
}

.time-chip {
  min-width: 84px;
}
</style>
