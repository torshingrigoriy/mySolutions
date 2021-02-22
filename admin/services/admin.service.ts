import {Injectable} from '@angular/core';
import {currBackendServerPath} from '../../../core/config';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {FormBuilder, FormGroup} from '@angular/forms';

export class Permit {
  constructor(
    public _id: string,
    public userId: string,
    public structureId: string,
    public accessId: string
  ) {
    this._id = _id;
    this.userId = userId;
    this.structureId = structureId;
    this.accessId = accessId;
  }
}

export class User {
  constructor(
    public id: string,
    public name: string,
    public login: string,
  ) {
    this.id = id;
    this.name = name;
    this.login = login;
  }
}

export class Patient {
  constructor(
    public id: string,
    public name: string,
    public login: string,
    public structures: Structure[],
  ) {
    this.id = id;
    this.name = name;
    this.login = login;
    this.structures = structures;
  }
}

export class Structure {
  constructor(
    public id: string,
    public name: string,
    public accesses: Access[]
  ) {
    this.id = id;
    this.name = name;
    this.accesses = accesses;
  }
}

export class Access {
  constructor(
    public id: string,
    public name: string,
    public status: Boolean
  ) {
    this.id = id;
    this.name = name;
    this.status = status;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  headers: HttpHeaders = new HttpHeaders({'Content-Type': 'application/json'});

  constructor(
    private _http: HttpClient,
    private fb: FormBuilder
  ) {
  }

  async getPatients() { //Должен отдать 6 юзеров, с 34 подразделениями и на каждом из них по 4 права
    let permits = await this.getPermits();

    let users = await this.getUsers();
    let structures = await this.getStructures();
    let accesses = await this.getAccesses();

    return users.reduce((patients: Patient[], user: User) => {

      let userPermits = permits.filter(permit => permit.userId == user.id);//получаю доступы для юзера

      let userStructures = structures.map(s => {//получаю все подразделения с правами
        let permittedAccesses = accesses.map(a => {
          if (userPermits.find(up => up.structureId == s.id && up.accessId == a.id)) {
            return new Access(
              a.id,
              a.name,
              true
            );
          } else {
            return a;
          }
        });
        return new Structure(
          s.id,
          s.name,
          permittedAccesses
        );
      });

      patients.push(new Patient(
        user.id,
        user.name,
        user.login,
        userStructures
      ));

      return patients;
    }, []);
  }

  /*Requests to backend*/

  async getAccesses(): Promise<Access[]> {
    return await this._http.get<Access[]>(`${currBackendServerPath}/getAccesses`, {headers: this.headers})
      .pipe(map(res => {
        return res.map((item, index) => {
          if (index == 0 || index == 1) {
            return new Access(
              // @ts-ignore
              item._id,
              item.name,
              true
            );
          } else {
            return new Access(
              // @ts-ignore
              item._id,
              item.name,
              false
            );
          }

        });
      }))
      .toPromise();
  }

  async getUsers(): Promise<User[]> {
    return await this._http.get<User[]>(`${currBackendServerPath}/getUsers`, {headers: this.headers})
      .pipe(map(res => {
          return res.map(item => {
            return new User(
              // @ts-ignore
              item._id,

              // @ts-ignore
              item.fullName,

              // @ts-ignore
              item.userName
            );
          });
        })
      ).toPromise();
  }

  async getStructures(): Promise<Structure[]> {
    return await this._http.get<Structure[]>(`${currBackendServerPath}/getStructuresMongo`, {headers: this.headers})
      .pipe(map(res => {
        return res.map(item => {
          return new Structure(
            // @ts-ignore
            item._id,
            item.name,
            []
          );
        });
      })).toPromise();
  }

  async getPermits(): Promise<Permit[]> {
    return await this._http.get<Permit[]>(`${currBackendServerPath}/getPermits`, {headers: this.headers}).toPromise();
  }

}
