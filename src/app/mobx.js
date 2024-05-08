import { makeAutoObservable, runInAction } from "mobx";

class Store {
  user = {};
  isMobileOpen = false;

  constructor() {
    makeAutoObservable(this);
    this.setIsMobileOpen = this.setIsMobileOpen.bind(this);
  }

  setIsMobileOpen(isMobileOpen) {
    runInAction(() => {
      this.isMobileOpen = isMobileOpen;
    });
  }
}

const MobxStore = new Store();
export default MobxStore;
