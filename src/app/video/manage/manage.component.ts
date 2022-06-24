import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import IClip from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss'],
})
export class ManageComponent implements OnInit {
  videoOrder = '1';
  clips: IClip[] = [];
  activeClip: IClip | null = null;
  sort$: BehaviorSubject<string>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clipService: ClipService,
    private modal: ModalService
  ) {
    this.sort$ = new BehaviorSubject<string>(this.videoOrder);
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params: Params) => {
      this.videoOrder = params.get('sort') ? params.get('sort') : '1';
      this.sort$.next(this.videoOrder);
    });

    this.clipService.getUserClips(this.sort$).subscribe((clips) => {
      this.clips = [];
      clips.forEach((clip) => {
        this.clips.push({
          ...clip.data(),
          docID: clip.id,
        });
      });
    });
  }

  sortVideos($event: Event) {
    const { value } = $event.target as HTMLInputElement;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sort: value },
    });
  }

  openModal($event: Event, clip: IClip) {
    $event.preventDefault();
    this.activeClip = clip;
    this.modal.toggleModal('editClip');
  }
  updateClip(clip: IClip) {
    this.clips = this.clips.map((c) => {
      if (c.docID === clip.docID) {
        return clip;
      }
      return c;
    });
  }
  async deleteClip($event: Event, clip: IClip) {
    $event.preventDefault();
    try {
      await this.clipService.deleteClip(clip);
      this.clips = this.clips.filter((c) => c.docID !== clip.docID);
    } catch (error) {
      console.error(error);
    }
  }
  async copyToClipboard($event: MouseEvent, docId: string | undefined) {
    $event.preventDefault();
    if (!docId) {
      return;
    }
    const url = `${location.origin}/clip/${docId}`;
    await navigator.clipboard.writeText(url);
    alert('Link Copied!');
  }
}
