<template>
  <ion-button :disabled="isProcessing" @click="presentActionSheet">
    <ion-spinner v-if="isProcessing" />
    <div v-else>
      <slot />
    </div>
  </ion-button>
</template>

<script setup lang="ts">
import { actionSheetController, IonButton, IonSpinner } from '@ionic/vue'
import { ref } from 'vue'
import { toastPopup } from '@/utils/popup'

const props = defineProps<{
  actionSheetHeader?: string
  actionSheetSubHeader?: string
  destructiveButtons?: { text: string, data: any }[]
  buttons: { text: string, data: any }[]
  callback: (res: any, payload: any) => Promise<void>
  payload: any
}>()

const isProcessing = ref(false)

const buttons = [
  { text: 'Annuler', role: 'cancel', data: 'Annuler' },
  ...(props.destructiveButtons || []).map(button => ({
    text: button.text,
    role: 'destructive',
    data: button.data,
  })),
  ...(props.buttons || []).map(button => ({
    text: button.text,
    data: button.data,
  })),
]

async function presentActionSheet() {
  const actionSheet = await actionSheetController.create({
    header: props.actionSheetHeader,
    subHeader: props.actionSheetSubHeader,
    buttons,
  })

  await actionSheet.present()

  const result = await actionSheet.onDidDismiss()
  if (result.role && result.role === 'cancel') {
    console.log(`ActionSheet "${props.actionSheetHeader}"" cancelled`)
    return
  }
  if (result.data) {
    console.debug(`ActionSheet ${props.actionSheetHeader} selected`, result.data)
    isProcessing.value = true
    try {
      await props.callback(result, props.payload)
    } catch (e: any) {
      console.error('Cannot process action sheet callback function', e)
      void toastPopup(e.message)
    }
    isProcessing.value = false
  } else {
    console.error(`ActionSheet result does not have any data`)
  }
}
</script>

<style></style>
