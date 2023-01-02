export enum NgxOutputEvents {
    ADDEDTOQUEUE = 'addedToQueue',
    ALLADDEDTOQUEUE = 'allAddedToQueue',
    UPLOADING = 'uploading',
    DONE = 'done',
    START = 'start',
    CANCELLED = 'cancelled',
    DRAGOVER = 'dragOver',
    DRAGOUT = 'dragOut',
    DROP = 'drop',
    REMOVED = 'removed',
    REMOVEDALL = 'removedAll',
    REJECTED = 'rejected'
}

export enum NgxInputEvents {
    // UPLOADALL = 'uploadAll', //DO NOT USE THIS
    UPLOADFILE = 'uploadFile',
    CANCEL = 'cancel',
    CANCELALL = 'cancelAll',
    REMOVE = 'remove',
    REMOVEALL = 'removeAll'
}
