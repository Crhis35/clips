import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ClipService } from 'src/app/services/clip.service';

@Component({
  selector: 'app-clip-list',
  templateUrl: './clip-list.component.html',
  styleUrls: ['./clip-list.component.scss'],
  providers: [DatePipe],
})
export class ClipListComponent implements OnInit, OnDestroy {
  @Input() scrollable = true;

  constructor(public clipService: ClipService) {
    this.clipService.getClips();
  }
  ngOnDestroy(): void {
    if (this.scrollable) {
      window.removeEventListener('scroll', this.handleScroll);
    }
    this.clipService.pageClips = [];
  }

  ngOnInit(): void {
    if (this.scrollable) {
      window.addEventListener('scroll', this.handleScroll);
    }
  }
  handleScroll = () => {
    const { scrollTop, offsetHeight } = document.documentElement;
    const { innerHeight } = window;
    const bottomOfWindow = Math.round(scrollTop) + innerHeight === offsetHeight;
    if (bottomOfWindow) {
      this.clipService.getClips();
    }
  };
}
