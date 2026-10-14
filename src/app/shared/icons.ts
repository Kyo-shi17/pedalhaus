import { addIcons } from 'ionicons';

import {
  addCircleOutline,
  addOutline,
  albumsOutline,
  alertCircleOutline,
  bicycleOutline,
  cameraOutline,
  cashOutline,
  checkmarkCircleOutline,
  cloudOfflineOutline,
  createOutline,
  cubeOutline,
  ellipsisHorizontal,
  eyeOffOutline,
  eyeOutline,
  flashOutline,
  gitBranchOutline,
  gridOutline,
  imageOutline,
  logOutOutline,
  mailOutline,
  personOutline,
  pricetagOutline,
  pricetagsOutline,
  refreshOutline,
  saveOutline,
  shieldCheckmarkOutline,
  syncOutline,
  timeOutline,
  trashOutline,
  trendingUpOutline
} from 'ionicons/icons';

/**
 * Ionicons ships as a tree-shaken set: any name used in a template must be
 * registered up-front or it renders as an empty box. Registering the whole set
 * in one place keeps templates and icons from drifting apart.
 */
export function registerAppIcons(): void {
  addIcons({
    'add-circle-outline': addCircleOutline,
    'add-outline': addOutline,
    'albums-outline': albumsOutline,
    'alert-circle-outline': alertCircleOutline,
    'bicycle-outline': bicycleOutline,
    'camera-outline': cameraOutline,
    'cash-outline': cashOutline,
    'checkmark-circle-outline': checkmarkCircleOutline,
    'cloud-offline-outline': cloudOfflineOutline,
    'create-outline': createOutline,
    'cube-outline': cubeOutline,
    'ellipsis-horizontal': ellipsisHorizontal,
    'eye-off-outline': eyeOffOutline,
    'eye-outline': eyeOutline,
    'flash-outline': flashOutline,
    'git-branch-outline': gitBranchOutline,
    'grid-outline': gridOutline,
    'image-outline': imageOutline,
    'log-out-outline': logOutOutline,
    'mail-outline': mailOutline,
    'person-outline': personOutline,
    'pricetag-outline': pricetagOutline,
    'pricetags-outline': pricetagsOutline,
    'refresh-outline': refreshOutline,
    'save-outline': saveOutline,
    'shield-checkmark-outline': shieldCheckmarkOutline,
    'sync-outline': syncOutline,
    'time-outline': timeOutline,
    'trash-outline': trashOutline,
    'trending-up-outline': trendingUpOutline
  });
}
