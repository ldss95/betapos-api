/**
 * Se hace el import de esta manera porque jest falla al hacerlo
 * como indica la documentacion de firebase
 * import { initializeApp, applicationDefault } from 'firebase/app';
 * import { getFirestore } from 'firebase/firestore';
 */

import * as firebase from 'firebase-admin'

firebase.initializeApp({
	credential: firebase.credential.applicationDefault()
})

const db = firebase.firestore()

export { db }
