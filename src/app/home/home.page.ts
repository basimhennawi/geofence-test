import { Component } from '@angular/core';
import { Geofence } from '@ionic-native/geofence/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage {

  public readonly fences: any[] = [{
    name: 'Gänsemarkt',
    lat: 53.555033,
    long: 9.989927,
    radius: 250,
    children: [{
      name: 'Office',
      lat: 53.555043,
      long: 9.989925,
      radius: 30,
    }, {
      name: 'Subway',
      lat: 53.555321,
      long: 9.987917,
      radius: 30,
    }, {
      name: 'Nivea',
      lat: 53.554639,
      long: 9.990656,
      radius: 30,
    }],
  }, {
    name: 'Pinneberg',
    lat: 53.655538,
    long: 9.797709,
    radius: 800,
    children: [{
      name: 'Home',
      lat: 53.660421,
      long: 9.799371,
      radius: 40,
    }],
  }];
  public logs: any[] = [];

  constructor(private geofence: Geofence) {
    this.geofence.initialize().then(
      () => {
        alert('Geofence Plugin Ready');
        // On transisition, register and unregister parents/children
        this.geofence.onTransitionReceived().subscribe(geofences => {
          geofences.forEach(function (geo) {
            let action;
            let name = geo.id.slice(0, geo.id.length - 3);
            let fenceFound = this.fences.find(f => name === f.name);
            if (geo.transitionType == 1) {
              action = 'Entered';
              if (fenceFound && fenceFound.children) {
                this.fences.forEach(this.unsubscribe, this);
                this.subscribe(fenceFound);
                fenceFound.children.forEach(this.subscribe, this);
              }
            } else if (geo.transitionType == 2) {
              action = 'Left';
              if (fenceFound && fenceFound.children) {
                fenceFound.children.forEach(this.unsubscribe, this);
                this.unsubscribe(fenceFound);
                this.fences.forEach(this.subscribe, this);
              }
            } else {
              action = 'Some event';
            }
            this.logs.push({
              action,
              name,
              date: new Date()
            });
          }, this);
        });

        // Subscribe parents
        this.fences.forEach(this.subscribe, this);
      },
      (err) => alert(err)
    );
  }

  public subscribe(item: { name: string, lat: number, long: number, radius: number }) {
    let fence = {
      id: item.name + '_id', // any unique ID
      latitude: item.lat, // center of geofence radius
      longitude: item.long,
      radius: 30, // radius to edge of geofence in meters
      transitionType: 3, // see 'Transition Types' below
      notification: { // notification settings
        title: 'You crossed ' + item.name + ' s fence.', // notification title
        text: 'You just arrived/left ' + item.name + '.', // notification body
        vibrate: [1000, 500, 2000], // Vibrate for 1 sec > Wait for 0.5 sec > Vibrate for 2 sec
        openAppOnClick: true // open app when notification is tapped
      }
    }
    
    this.geofence.addOrUpdate(fence).then(
      () => {
        this.logs.push({
          action: 'Registered',
          name: item.name,
          date: new Date()
        });
      },
      (err) => alert(JSON.stringify(err))
    );
  }

  public unsubscribe(item: { name: string }) {
    this.geofence.remove(name + '_id').then(
      () => {
        this.logs.push({
          action: 'Deregistered',
          name: item.name,
          date: new Date()
        });
      },
      (err) => alert(JSON.stringify(err))
    );
  }
}
