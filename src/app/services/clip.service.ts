import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentReference,
  QuerySnapshot,
} from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  lastValueFrom,
  map,
  of,
  switchMap,
} from 'rxjs';
import IClip from '../models/clip.model';

@Injectable({
  providedIn: 'root',
})
export class ClipService implements Resolve<IClip | null> {
  public clipsCollection: AngularFirestoreCollection<IClip>;
  pageClips: IClip[] = [];
  pendingReq = false;

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage,
    private router: Router
  ) {
    this.clipsCollection = this.db.collection<IClip>('clips');
  }
  createClip(input: IClip): Promise<DocumentReference<IClip>> {
    return this.clipsCollection.add(input);
  }

  getUserClips(sort$: BehaviorSubject<string>) {
    return combineLatest([this.auth.user, sort$]).pipe(
      switchMap(([user, sort]) => {
        if (!user) {
          return of([]);
        }
        return this.clipsCollection.ref
          .where('uid', '==', user.uid)
          .orderBy('timestamp', sort === '1' ? 'desc' : 'asc')
          .get();
        // return this.db
        //   .collection<IClip>('clips', (ref) => ref.where('uid', '==', user.uid))
        //   .valueChanges();
      }),
      map((snapshot) => (snapshot as QuerySnapshot<IClip>).docs)
    );
  }

  updateClip(id: string, title: string) {
    return this.clipsCollection.doc(id).update({ title });
  }

  async deleteClip(clip: IClip) {
    const clipRef = this.storage.ref(`clips/${clip.fileName}`);
    const screenshotRef = this.storage.ref(
      `screenshots/${clip.screenshotFileName}`
    );
    clipRef.delete();
    screenshotRef.delete();
    await this.clipsCollection.doc(clip.docID).delete();
  }
  async getClips() {
    if (this.pendingReq) {
      return;
    }
    this.pendingReq = true;
    let query = this.clipsCollection.ref.orderBy('timestamp', 'desc').limit(6);
    const { length } = this.pageClips;

    if (length) {
      const lasDocID = this.pageClips[length - 1].docID;
      const lasDoc = await lastValueFrom(
        this.clipsCollection.doc(lasDocID).get()
      );
      query = query.startAfter(lasDoc);
    }

    const snapshot = await query.get();
    snapshot.forEach((doc) => {
      this.pageClips.push({
        ...doc.data(),
        docID: doc.id,
      });
    });
    this.pendingReq = false;
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.clipsCollection
      .doc(route.params.id)
      .get()
      .pipe(
        map((snapshot) => {
          const data = snapshot.data();
          if (!data) {
            this.router.navigate(['/']);
            return null;
          }
          return data;
        })
      );
  }
}
