import {
  Component,
  ContentChildren,
  AfterContentInit,
  QueryList,
} from '@angular/core';
import { TabComponent } from '../tab/tab.component';

@Component({
  selector: 'app-tabs-container',
  templateUrl: './tabs-container.component.html',
  styleUrls: ['./tabs-container.component.scss'],
})
export class TabsContainerComponent implements AfterContentInit {
  @ContentChildren(TabComponent) tabs: QueryList<TabComponent> =
    new QueryList();

  constructor() {}

  ngAfterContentInit(): void {
    const activeTabs = this.tabs?.filter((tab) => tab.active);
    if (activeTabs?.length === 0) {
      this.selectTab(this.tabs!.first);
    }
  }

  selectTab(first: TabComponent) {
    this.tabs?.forEach((tab) => (tab.active = false));
    first.active = true;
    return false;
  }
}
